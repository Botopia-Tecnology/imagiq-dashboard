"use client"

import { useState, useEffect, useMemo, useRef, DragEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Save,
  Loader2,
  Search,
  LayoutGrid,
  AlertCircle,
  CheckCircle2,
  Upload,
  ImageIcon,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { SerpPreview } from "./SerpPreview"
import { OgPreview } from "./OgPreview"
import { CharCounter } from "./CharCounter"
import { useSeoCategorias } from "@/hooks/use-seo-settings"
import type { CategoriaSeoData } from "@/types/seo"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const MAX_OG_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_OG_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

interface CategoriasEditorProps {
  siteUrl: string
  siteName: string
  titleTemplate: string
  defaultDescription: string
  defaultOgImage: string
}

type FormState = Pick<
  CategoriaSeoData,
  | "meta_title"
  | "meta_description"
  | "meta_keywords"
  | "og_image"
  | "seo_og_title"
  | "seo_og_description"
  | "seo_canonical"
  | "seo_no_index"
  | "seo_no_follow"
  | "include_in_sitemap"
>

const emptyForm: FormState = {
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image: "",
  seo_og_title: "",
  seo_og_description: "",
  seo_canonical: "",
  seo_no_index: false,
  seo_no_follow: false,
  include_in_sitemap: true,
}

function toForm(c: CategoriaSeoData): FormState {
  return {
    meta_title: c.meta_title || "",
    meta_description: c.meta_description || "",
    meta_keywords: c.meta_keywords || "",
    og_image: c.og_image || "",
    seo_og_title: c.seo_og_title || "",
    seo_og_description: c.seo_og_description || "",
    seo_canonical: c.seo_canonical || "",
    seo_no_index: c.seo_no_index ?? false,
    seo_no_follow: c.seo_no_follow ?? false,
    include_in_sitemap: c.include_in_sitemap ?? true,
  }
}

/**
 * Turn a category's display name into a URL-friendly slug that matches the
 * same logic used by the storefront navbar (lowercase, accents removed,
 * spaces → hyphens).
 */
function slugifyCategoria(c: CategoriaSeoData): string {
  const source = c.nombre_visible || c.nombre || ""
  return source
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function hasIssues(c: CategoriaSeoData): boolean {
  if (!c.meta_title || c.meta_title.length < 30 || c.meta_title.length > 60) return true
  if (!c.meta_description || c.meta_description.length < 120 || c.meta_description.length > 160) return true
  return false
}

export function CategoriasEditor({
  siteUrl,
  siteName,
  titleTemplate,
  defaultDescription,
  defaultOgImage,
}: CategoriasEditorProps) {
  const { categorias, isLoading, updateCategoriaSeo } = useSeoCategorias()

  const [selectedUuid, setSelectedUuid] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [originalForm, setOriginalForm] = useState<FormState>(emptyForm)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingOg, setIsUploadingOg] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => categorias.find((c) => c.uuid === selectedUuid) || null,
    [categorias, selectedUuid]
  )

  useEffect(() => {
    if (!selectedUuid && categorias.length > 0) {
      setSelectedUuid(categorias[0].uuid)
    }
  }, [categorias, selectedUuid])

  useEffect(() => {
    if (selected) {
      const next = toForm(selected)
      setForm(next)
      setOriginalForm(next)
    }
  }, [selected])

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalForm),
    [form, originalForm]
  )

  const filteredCategorias = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categorias.filter((c) => {
      if (activeFilter === "active" && !c.activo) return false
      if (activeFilter === "inactive" && c.activo) return false
      if (!q) return true
      return (
        (c.nombre_visible || "").toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        (c.meta_title || "").toLowerCase().includes(q)
      )
    })
  }, [categorias, query, activeFilter])

  const handleSave = async () => {
    if (!selected) return
    try {
      setIsSaving(true)
      await updateCategoriaSeo(selected.uuid, form)
      setOriginalForm(form)
      toast.success(`SEO guardado: ${selected.nombre_visible || selected.nombre}`)
    } catch {
      toast.error("No se pudo guardar los cambios")
    } finally {
      setIsSaving(false)
    }
  }

  const handleOgFileUpload = async (file: File) => {
    if (!selected) return

    if (!ALLOWED_OG_MIMES.includes(file.type)) {
      toast.error("Formato no soportado. Usa JPG, PNG o WebP.")
      return
    }
    if (file.size > MAX_OG_IMAGE_BYTES) {
      toast.error("Archivo muy grande (máx 2MB)")
      return
    }

    try {
      setIsUploadingOg(true)
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `${API_URL}/api/multimedia/categorias/${selected.uuid}/og-image`,
        {
          method: "POST",
          headers: { ...(API_KEY && { "X-API-Key": API_KEY }) },
          body: formData,
        }
      )
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

      const json = (await res.json()) as { url: string }
      setForm((f) => ({ ...f, og_image: json.url }))
      setOriginalForm((f) => ({ ...f, og_image: json.url }))
      await updateCategoriaSeo(selected.uuid, { og_image: json.url })
      toast.success("OG image subida")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen")
    } finally {
      setIsUploadingOg(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleOgFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleOgFileUpload(file)
  }

  const clearOgImage = async () => {
    if (!selected) return
    setForm((f) => ({ ...f, og_image: "" }))
    setOriginalForm((f) => ({ ...f, og_image: "" }))
    try {
      await updateCategoriaSeo(selected.uuid, { og_image: "" })
      toast.success("OG image eliminada")
    } catch {
      toast.error("No se pudo eliminar la imagen")
    }
  }

  const slug = selected ? slugifyCategoria(selected) : ""
  const defaultUrl = `${siteUrl}/productos/${slug}`
  const previewTitle = (() => {
    const base = form.meta_title || selected?.nombre_visible || selected?.nombre || ""
    if (!base) return ""
    if (titleTemplate && titleTemplate.includes("%s")) return titleTemplate.replace("%s", base)
    return base
  })()
  const previewDescription = form.meta_description || defaultDescription || ""
  const previewUrl = form.seo_canonical || defaultUrl
  const previewOgTitle = form.seo_og_title || previewTitle
  const previewOgDescription = form.seo_og_description || previewDescription
  const previewOgImage = form.og_image || defaultOgImage

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ─── Master: category list ─── */}
      <Card className="flex flex-col overflow-hidden h-[calc(100vh-260px)] min-h-[500px]">
        <CardHeader className="space-y-3 pb-3 shrink-0">
          <CardTitle className="text-base">Categorías</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoría..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "text-xs px-2 py-1 rounded-md transition-colors",
                  activeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                {f === "all" ? "Todas" : f === "active" ? "Activas" : "Inactivas"}
              </button>
            ))}
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 pb-3 space-y-1">
            {isLoading && (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando categorías...
              </div>
            )}
            {!isLoading && filteredCategorias.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No se encontraron categorías
              </p>
            )}
            {filteredCategorias.map((c) => {
              const issues = hasIssues(c)
              const isSelected = c.uuid === selectedUuid
              const displayName = c.nombre_visible || c.nombre
              return (
                <button
                  key={c.uuid}
                  onClick={() => setSelectedUuid(c.uuid)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-md border transition-colors",
                    isSelected
                      ? "bg-primary/10 border-primary/40"
                      : "border-transparent hover:bg-muted hover:border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        /productos/{slugifyCategoria(c)}
                      </p>
                    </div>
                    {issues ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        c.activo
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {c.activo ? "Activa" : "Inactiva"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      orden {c.orden}
                    </span>
                    {c.seo_no_index && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400">
                        noindex
                      </span>
                    )}
                    {!c.include_in_sitemap && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        off-sitemap
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* ─── Detail ─── */}
      {!selected ? (
        <Card className="flex items-center justify-center">
          <CardContent className="text-center py-16">
            <LayoutGrid className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Selecciona una categoría para editar su SEO
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">
                    {selected.nombre_visible || selected.nombre}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs truncate">
                    {defaultUrl}
                  </CardDescription>
                </div>
                <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta título</Label>
                <Input
                  id="meta_title"
                  value={form.meta_title || ""}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  placeholder={selected.nombre_visible || selected.nombre}
                />
                <CharCounter value={form.meta_title || ""} min={30} max={60} label="Meta título" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta descripción</Label>
                <Textarea
                  id="meta_description"
                  rows={3}
                  value={form.meta_description || ""}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  placeholder={selected.descripcion || defaultDescription}
                />
                <CharCounter
                  value={form.meta_description || ""}
                  min={120}
                  max={160}
                  label="Meta descripción"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Palabras clave</Label>
                <Input
                  id="meta_keywords"
                  value={form.meta_keywords || ""}
                  onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                  placeholder="separadas, por, comas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_canonical">Canonical URL</Label>
                <Input
                  id="seo_canonical"
                  value={form.seo_canonical || ""}
                  onChange={(e) => setForm({ ...form, seo_canonical: e.target.value })}
                  placeholder={defaultUrl}
                />
                <p className="text-xs text-muted-foreground">
                  URL oficial de esta categoría. Déjalo vacío para usar {defaultUrl}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open Graph (redes sociales)</CardTitle>
              <CardDescription>
                Overrides para cuando esta categoría se comparta en redes sociales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_og_title">OG título</Label>
                <Input
                  id="seo_og_title"
                  value={form.seo_og_title || ""}
                  onChange={(e) => setForm({ ...form, seo_og_title: e.target.value })}
                  placeholder={form.meta_title || selected.nombre_visible || selected.nombre}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_og_description">OG descripción</Label>
                <Textarea
                  id="seo_og_description"
                  rows={2}
                  value={form.seo_og_description || ""}
                  onChange={(e) => setForm({ ...form, seo_og_description: e.target.value })}
                  placeholder={form.meta_description || defaultDescription}
                />
              </div>
              <div className="space-y-2">
                <Label>OG imagen</Label>
                {form.og_image ? (
                  <div className="relative group rounded-lg overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.og_image} alt="OG preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingOg}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Cambiar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={clearOgImage}
                        disabled={isUploadingOg}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Quitar
                      </Button>
                    </div>
                    {isUploadingOg && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingOg && fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleOgFileDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    {isUploadingOg ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
                        <p className="text-sm font-medium">
                          Arrastra una imagen o haz click para subir
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG o WebP · máx 2MB · recomendado 1200×630
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleOgFileUpload(file)
                  }}
                />
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    ¿Ya tienes una URL? Pégala aquí
                  </summary>
                  <Input
                    className="mt-2"
                    value={form.og_image || ""}
                    onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                    placeholder={defaultOgImage || "https://..."}
                  />
                </details>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Control de indexación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Incluir en sitemap</p>
                  <p className="text-xs text-muted-foreground">
                    Los buscadores descubrirán esta categoría vía sitemap.xml
                  </p>
                </div>
                <Switch
                  checked={form.include_in_sitemap}
                  onCheckedChange={(v) => setForm({ ...form, include_in_sitemap: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">No indexar (noindex)</p>
                  <p className="text-xs text-muted-foreground">
                    La categoría no aparecerá en resultados de búsqueda
                  </p>
                </div>
                <Switch
                  checked={form.seo_no_index}
                  onCheckedChange={(v) => setForm({ ...form, seo_no_index: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">No seguir enlaces (nofollow)</p>
                  <p className="text-xs text-muted-foreground">
                    Los buscadores no seguirán los enlaces de esta categoría
                  </p>
                </div>
                <Switch
                  checked={form.seo_no_follow}
                  onCheckedChange={(v) => setForm({ ...form, seo_no_follow: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vista previa en Google</CardTitle>
            </CardHeader>
            <CardContent>
              <SerpPreview title={previewTitle} description={previewDescription} url={previewUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vista previa en redes sociales</CardTitle>
            </CardHeader>
            <CardContent>
              <OgPreview
                title={previewOgTitle}
                description={previewOgDescription}
                image={previewOgImage}
                siteName={siteName}
                url={previewUrl}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
