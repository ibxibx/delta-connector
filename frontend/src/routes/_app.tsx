import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <TopBar />
          <main className="relative flex-1">
            {/* Berlin panorama background with a constant 50% white veil (not a gradient) */}
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-fixed"
              style={{ backgroundImage: "url('/berlin_panorama.png')" }}
            />
            <div className="pointer-events-none absolute inset-0 z-0 bg-white/50" />
            <div className="relative z-[1] p-6 md:p-8 max-w-[1400px] w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
