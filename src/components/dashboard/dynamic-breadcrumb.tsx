"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { useCategories } from "@/features/categories/useCategories"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const { categories } = useCategories()

  // Generar los items del breadcrumb basado en el pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href?: string; id?: string }[] = []

    // Siempre empezar con Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/inicio', id: 'dashboard' })

    // Mapear rutas a nombres amigables
    const routeNames: { [key: string]: string } = {
      'inicio': 'Inicio',
      'pagina-web': 'Página Web',
      'categorias': 'Categorías',
      'productos': 'Productos',
      'clientes': 'Clientes',
      'pedidos': 'Pedidos',
      'analytics': 'Analytics',
      'marketing': 'Marketing',
      'campaigns': 'Campañas',
      'templates': 'Plantillas',
      'whatsapp': 'WhatsApp',
      'banners': 'Banners',
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    let currentPath = ''
    let categoryId: string | null = null

    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i]
      currentPath += `/${segment}`

      // Si es un UUID
      if (uuidRegex.test(segment)) {
        // Determinar si es categoryId o menuId según el contexto
        const prevSegment = paths[i - 1]

        if (prevSegment === 'categorias') {
          // Es un categoryId
          categoryId = segment
          const category = categories.find(cat => cat.id === segment)

          // Si el siguiente segmento es 'menus', agregar breadcrumb de menús
          if (paths[i + 1] === 'menus') {
            breadcrumbs.push({
              label: category ? `Menús de ${category.name}` : 'Menús',
              href: i + 1 === paths.length - 1 ? undefined : currentPath + '/menus',
              id: `menus-${segment}`
            })
          }
        } else if (prevSegment === 'menus' && categoryId) {
          // Es un menuId
          const category = categories.find(cat => cat.id === categoryId)
          const menu = category?.menus.find(m => m.id === segment)

          // Si el siguiente segmento es 'submenus', agregar breadcrumb de submenús
          if (paths[i + 1] === 'submenus') {
            breadcrumbs.push({
              label: menu ? `Submenús de ${menu.name}` : 'Submenús',
              href: undefined, // Es la página actual
              id: `submenus-${segment}`
            })
          }
        }
        continue
      }

      // Agregar el segmento si tiene un nombre amigable
      if (routeNames[segment]) {
        const isLast = i === paths.length - 1
        breadcrumbs.push({
          label: routeNames[segment],
          href: isLast ? undefined : currentPath,
          id: segment
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id || `crumb-${index}`} className="contents">
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : undefined}>
              {crumb.href ? (
                <BreadcrumbLink href={crumb.href}>
                  {crumb.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : undefined} />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
