import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/dashboard/dynamic-breadcrumb"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { UserProfile } from "@/components/auth/UserProfile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 px-4 flex-1">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
            <div className="flex items-center gap-2 px-4">
              <UserProfile />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  )
}