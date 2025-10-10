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
    const breadcrumbs: { label: string; href?: string }[] = []

    // Siempre empezar con Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/inicio' })

    // Mapear rutas a nombres amigables
    const routeNames: { [key: string]: string } = {
      'inicio': 'Inicio',
      'pagina-web': 'Página Web',
      'categorias': 'Categorías',
      'subcategorias': 'Subcategorías',
      'productos': 'Productos',
      'clientes': 'Clientes',
      'pedidos': 'Pedidos',
      'analytics': 'Analytics',
    }

    let currentPath = ''

    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i]
      currentPath += `/${segment}`

      // Si es un UUID (categoryId), buscar el nombre de la categoría
      if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const category = categories.find(cat => cat.id === segment)
        if (category && paths[i + 1] === 'subcategorias') {
          breadcrumbs.push({
            label: `Subcategorías de ${category.name}`,
            href: undefined // Es la página actual
          })
          break // No continuar procesando
        }
        continue
      }

      // Agregar el segmento si tiene un nombre amigable
      if (routeNames[segment]) {
        const isLast = i === paths.length - 1
        breadcrumbs.push({
          label: routeNames[segment],
          href: isLast ? undefined : currentPath
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
          <div key={index} className="contents">
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
