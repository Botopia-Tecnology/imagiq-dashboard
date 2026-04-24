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
  Package,
  AlertCircle,
  CheckCircle2,
  Upload,
  ImageIcon,
  X,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { SerpPreview } from "./SerpPreview"
import { OgPreview } from "./OgPreview"
import { CharCounter } from "./CharCounter"
import { useSeoProductos } from "@/hooks/use-seo-settings"
import type { ProductSeoData, CatalogSearchResult } from "@/types/seo"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const MAX_OG_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_OG_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

interface ProductosEditorProps {
  siteUrl: string
  siteName: string
  titleTemplate: string
  defaultDescription: string
  defaultOgImage: string
}

type FormState = Pick<
  ProductSeoData,
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

function toForm(o: ProductSeoData): FormState {
  return {
    meta_title: o.meta_title || "",
    meta_description: o.meta_description || "",
    meta_keywords: o.meta_keywords || "",
    og_image: o.og_image || "",
    seo_og_title: o.seo_og_title || "",
    seo_og_description: o.seo_og_description || "",
    seo_canonical: o.seo_canonical || "",
    seo_no_index: o.seo_no_index ?? false,
    seo_no_follow: o.seo_no_follow ?? false,
    include_in_sitemap: o.include_in_sitemap ?? true,
  }
}

function hasIssues(o: ProductSeoData): boolean {
  if (!o.meta_title || o.meta_title.length < 30 || o.meta_title.length > 60) return true
  if (!o.meta_description || o.meta_description.length < 120 || o.meta_description.length > 160) return true
  return false
}

export function ProductosEditor({
  siteUrl,
  siteName,
  titleTemplate,
  defaultDescription,
  defaultOgImage,
}: ProductosEditorProps) {
  const { overrides, isLoading, upsertProductSeo, deleteProductSeo, searchCatalog } = useSeoProductos()

  const [selectedCodigoMarket, setSelectedCodigoMarket] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [originalForm, setOriginalForm] = useState<FormState>(emptyForm)
  const [query, setQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingOg, setIsUploadingOg] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // ─── Catalog search (for adding new overrides) ─────────────────────────
  const [isAddingSku, setIsAddingSku] = useState(false)
  const [catalogQuery, setCatalogQuery] = useState("")
  const [catalogResults, setCatalogResults] = useState<CatalogSearchResult[]>([])
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false)
  const [catalogSearched, setCatalogSearched] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => overrides.find((o) => o.codigoMarket === selectedCodigoMarket) || null,
    [overrides, selectedCodigoMarket]
  )

  useEffect(() => {
    if (!selectedCodigoMarket && overrides.length > 0) {
      setSelectedCodigoMarket(overrides[0].codigoMarket)
    }
  }, [overrides, selectedCodigoMarket])

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

  const filteredOverrides = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return overrides
    return overrides.filter(
      (o) =>
        o.codigoMarket.toLowerCase().includes(q) ||
        (o.meta_title || "").toLowerCase().includes(q)
    )
  }, [overrides, query])

  const handleSave = async () => {
    if (!selected) return
    try {
      setIsSaving(true)
      await upsertProductSeo(selected.codigoMarket, form)
      setOriginalForm(form)
      toast.success(`SEO guardado: ${selected.codigoMarket}`)
    } catch {
      toast.error("No se pudo guardar los cambios")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCatalogSearch = async () => {
    const q = catalogQuery.trim()
    if (!q) return
    try {
      setIsSearchingCatalog(true)
      setCatalogSearched(true)
      const results = await searchCatalog(q, 15)
      setCatalogResults(results)
    } catch {
      toast.error("Error al buscar en el catálogo")
      setCatalogResults([])
    } finally {
      setIsSearchingCatalog(false)
    }
  }

  const handleSelectCatalogResult = async (row: CatalogSearchResult) => {
    // The override is keyed by codigoMarket — the product group that bundles
    // every variant SKU of the same model. If an override already exists for
    // this product, just select it in the master list.
    if (overrides.some((o) => o.codigoMarket === row.codigoMarket)) {
      toast.info(`${row.codigoMarket} ya tiene override, seleccionado en la lista`)
      setSelectedCodigoMarket(row.codigoMarket)
      setIsAddingSku(false)
      setCatalogQuery("")
      setCatalogResults([])
      setCatalogSearched(false)
      return
    }
    try {
      setIsSaving(true)
      // Pre-populate meta_title with the product name so the editor starts
      // with something useful instead of an empty form.
      await upsertProductSeo(row.codigoMarket, {
        meta_title: row.nombreMarket || "",
        include_in_sitemap: true,
      })
      setSelectedCodigoMarket(row.codigoMarket)
      setIsAddingSku(false)
      setCatalogQuery("")
      setCatalogResults([])
      setCatalogSearched(false)
      toast.success(`Override creado para ${row.codigoMarket}`)
    } catch {
      toast.error("No se pudo crear el override")
    } finally {
      setIsSaving(false)
    }
  }

  const cancelAddSku = () => {
    setIsAddingSku(false)
    setCatalogQuery("")
    setCatalogResults([])
    setCatalogSearched(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm(`¿Eliminar el override SEO de ${selected.codigoMarket}?`)) return
    try {
      await deleteProductSeo(selected.codigoMarket)
      setSelectedCodigoMarket(null)
      toast.success("Override eliminado")
    } catch {
      toast.error("No se pudo eliminar el override")
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
        `${API_URL}/api/products/seo/overrides/${encodeURIComponent(selected.codigoMarket)}/og-image`,
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
      await upsertProductSeo(selected.codigoMarket, { og_image: json.url })
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
      await upsertProductSeo(selected.codigoMarket, { og_image: "" })
      toast.success("OG image eliminada")
    } catch {
      toast.error("No se pudo eliminar la imagen")
    }
  }

  const defaultUrl = selected
    ? `${siteUrl}/productos/view/${selected.codigoMarket}`
    : ""
  const previewTitle = (() => {
    const base = form.meta_title || selected?.codigoMarket || ""
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
      {/* ─── Master ─── */}
      <Card className="flex flex-col overflow-hidden h-[calc(100vh-260px)] min-h-[500px]">
        <CardHeader className="space-y-3 pb-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Productos con SEO personalizado</CardTitle>
            {!isAddingSku && (
              <Button size="sm" variant="outline" onClick={() => setIsAddingSku(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir producto
              </Button>
            )}
          </div>

          {isAddingSku ? (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Buscar en catálogo Novasoft
                </p>
                <button
                  type="button"
                  onClick={cancelAddSku}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Código market, SKU o nombre..."
                    value={catalogQuery}
                    onChange={(e) => setCatalogQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCatalogSearch()}
                    className="pl-8 h-9"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleCatalogSearch}
                  disabled={!catalogQuery.trim() || isSearchingCatalog}
                >
                  {isSearchingCatalog ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>
              {catalogSearched && !isSearchingCatalog && (
                <div className="space-y-1 max-h-64 overflow-auto">
                  {catalogResults.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      Sin resultados en Novasoft para &quot;{catalogQuery}&quot;
                    </p>
                  ) : (
                    catalogResults.map((row) => {
                      const alreadyExists = overrides.some(
                        (o) => o.codigoMarket === row.codigoMarket,
                      )
                      const firstImage = (row.urlImagenes || "").split(/[,;|]/)[0]?.trim()
                      return (
                        <button
                          key={row.sku}
                          type="button"
                          onClick={() => handleSelectCatalogResult(row)}
                          className="w-full flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted text-left transition-colors"
                        >
                          {firstImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={firstImage}
                              alt={row.nombreMarket}
                              className="w-10 h-10 object-contain rounded bg-muted shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {row.nombreMarket || row.codigoMarket}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                              Grupo: {row.codigoMarket}
                              {row.modelo ? ` · ${row.modelo}` : ""}
                            </p>
                          </div>
                          {alreadyExists && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                              ya tiene override
                            </span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar overrides por código market o título..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          )}
        </CardHeader>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 pb-3 space-y-1">
            {isLoading && (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando productos...
              </div>
            )}
            {!isLoading && filteredOverrides.length === 0 && (
              <div className="text-sm text-muted-foreground p-6 text-center">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">Aún no hay productos con SEO personalizado</p>
                <p className="text-xs mt-1">
                  Usa &quot;Añadir producto&quot; para crear el primer override
                </p>
              </div>
            )}
            {filteredOverrides.map((o) => {
              const issues = hasIssues(o)
              const isSelected = o.codigoMarket === selectedCodigoMarket
              return (
                <button
                  key={o.codigoMarket}
                  onClick={() => setSelectedCodigoMarket(o.codigoMarket)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-md border transition-colors",
                    isSelected
                      ? "bg-primary/10 border-primary/40"
                      : "border-transparent hover:bg-muted hover:border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate font-mono">
                        {o.codigoMarket}
                      </p>
                      {o.meta_title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {o.meta_title}
                        </p>
                      )}
                    </div>
                    {issues ? (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {o.seo_no_index && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400">
                        noindex
                      </span>
                    )}
                    {!o.include_in_sitemap && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        off-sitemap
                      </span>
                    )}
                    {o.og_image && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">
                        OG
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
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Selecciona un producto o añade uno nuevo para empezar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate font-mono">
                    {selected.codigoMarket}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs truncate">
                    {defaultUrl}
                  </CardDescription>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Este override aplica a todas las variantes (color, capacidad) del mismo producto.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDelete}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar
                  </Button>
                </div>
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
                  placeholder="Título del producto en buscadores"
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
                  placeholder={defaultDescription}
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
                  Déjalo vacío para usar {defaultUrl}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open Graph (redes sociales)</CardTitle>
              <CardDescription>
                Overrides para cuando este producto se comparta en redes sociales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_og_title">OG título</Label>
                <Input
                  id="seo_og_title"
                  value={form.seo_og_title || ""}
                  onChange={(e) => setForm({ ...form, seo_og_title: e.target.value })}
                  placeholder={form.meta_title || selected.codigoMarket}
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
                    Los buscadores descubrirán este producto vía sitemap.xml
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
                    El producto no aparecerá en resultados de búsqueda
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
                    Los buscadores no seguirán los enlaces de este producto
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
