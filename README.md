# E-Commerce Dashboard

Dashboard administrativo moderno para e-commerce construido con Next.js 15, shadcn/ui, TanStack Table y TypeScript.

## 🚀 Características

- **Framework**: Next.js 15 con App Router
- **UI Components**: shadcn/ui (última versión)
- **Estilos**: Tailwind CSS 4
- **Íconos**: Lucide React
- **Tablas**: TanStack Table v8 con shadcn/ui Data Table
- **Gráficas**: Recharts con Chart components de shadcn/ui
- **Formularios**: React Hook Form + Zod para validación
- **TypeScript**: Para type safety completo
- **Theme**: next-themes para dark/light mode
- **Responsivo**: Mobile-first approach

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── inicio/
│   │   ├── productos/
│   │   ├── ordenes/
│   │   ├── pagina-web/
│   │   ├── marketing/
│   │   ├── clientes/
│   │   ├── punto-fisico/
│   │   └── bodega/
│   ├── (account)/
│   │   ├── facturacion/
│   │   ├── configuraciones/
│   │   └── usuarios/
│   └── api/
├── components/
│   ├── dashboard/
│   ├── charts/
│   ├── tables/
│   ├── forms/
│   └── ui/ (shadcn components)
├── lib/
│   ├── utils.ts
│   └── mock-data/
├── hooks/
├── types/
└── styles/
```

## 🛠️ Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

3. **Construir para producción**
```bash
npm run build
npm start
```

## 📱 Funcionalidades Implementadas

### 1. Dashboard de Inicio
- Cards de métricas principales (ventas, órdenes, clientes, conversión)
- Gráficas interactivas con Recharts
- Tabla de actividad reciente
- Distribución por categorías y métodos de pago
- Top productos

### 2. Gestión de Productos
- Tabla avanzada con TanStack Table
- Búsqueda y filtros facetados
- Sorting y paginación
- Row selection para acciones bulk
- Métricas de inventario
- Column visibility toggle

### 3. Layout y Navegación
- Sidebar colapsable con navegación
- Topbar con breadcrumbs
- Mobile responsive con Sheet
- Dark/Light mode toggle
- Theme provider configurado

### 4. Componentes Reutilizables
- DataTable genérico con toolbar
- MetricCard con tendencias
- Charts con configuración
- Theme toggle
- Componentes UI de shadcn/ui

## 🎨 Temas

El dashboard incluye soporte completo para dark/light mode:

- **Light Mode**: Tema claro por defecto
- **Dark Mode**: Tema oscuro
- **System**: Sigue la preferencia del sistema
- Toggle disponible en el sidebar

## 📊 Datos Mock

El proyecto incluye datos mock realistas para:

- **Productos**: 12 productos con categorías, precios, stock
- **Órdenes**: 10 órdenes con diferentes estados
- **Clientes**: 15 clientes con segmentación
- **Métricas**: Datos de ventas, gráficas y actividad
- **Campañas**: 8 campañas de marketing

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

## 📱 Responsividad

El dashboard está completamente optimizado para:

- **Desktop**: Experiencia completa con sidebar
- **Tablet**: Navegación adaptada
- **Mobile**: Sidebar como drawer, tablas con scroll horizontal

## 🔒 Mejores Prácticas

- **Server Components**: Por defecto
- **Client Components**: Solo para interactividad
- **Performance**: Lazy loading y optimistic updates
- **Accesibilidad**: ARIA labels y navegación por teclado
- **SEO**: Meta tags configurados

## 📝 Notas Importantes

- NO implementa backend real, usa datos mock
- NO usa localStorage/sessionStorage
- Estado en memoria con React state
- Todos los componentes son funcionales con hooks
- Sigue convenciones de shadcn/ui
- Sin errores en consola
- Código limpio siguiendo principios SOLID

---

**Built with ❤️ using Next.js 15, shadcn/ui, and modern web technologies.**
