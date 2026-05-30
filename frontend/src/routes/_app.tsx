import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full bg-background">
        {/* App-wide Berlin panorama: spans behind the sidebar AND content so the
            semi-transparent sidebar blends into the same image. */}
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/berlin_panorama.png')" }}
        />
        <div className="pointer-events-none fixed inset-0 z-0 bg-white/50" />

        <AppSidebar />
        <SidebarInset className="relative z-[1] flex flex-col min-w-0 bg-transparent">
          <main className="relative flex-1">
            <div className="relative z-[1] p-6 md:p-8 max-w-[1400px] w-full mx-auto">
              {/* Sidebar collapse toggle (moved here from the removed top bar) */}
              <SidebarTrigger className="mb-4 -ml-1 text-foreground" />
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
