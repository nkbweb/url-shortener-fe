import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex w-full flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-2 h-9 w-9 text-muted-foreground hover:bg-muted/50 rounded-lg" />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
          
          {/* Main Content area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
