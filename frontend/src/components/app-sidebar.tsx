import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, User, UserPlus, Network, LayoutDashboard, Globe2 } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { currentUser } from "@/lib/mock-data";

const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Ask", url: "/ask", icon: Search },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Recommend", url: "/recommend", icon: UserPlus },
  { title: "Graph", url: "/graph", icon: Network },
  { title: "My Network", url: "/network", icon: Globe2 },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-6 pb-4">
        <Link to="/" className="flex flex-col items-center gap-2 px-1">
          <img
            src="/delta-connector-logo-transparent.png"
            alt="Delta Connector"
            className="w-[150px] max-w-full object-contain group-data-[collapsible=icon]:hidden"
          />
          {/* Collapsed (icon) state shows just the triangle mark */}
          <img
            src="/delta-triangle-logo-transparent.png"
            alt="Delta Connector"
            className="hidden size-8 object-contain group-data-[collapsible=icon]:block"
          />
          <span className="text-center text-[11px] leading-snug text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
            Connecting founders to the people &amp; resources they need
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 justify-center">
        <SidebarGroup className="py-2 flex-none">
          <SidebarGroupLabel className="px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/40">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="h-11 gap-3 rounded-xl px-3 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 transition-colors hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-sm"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="size-[18px] shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 group-data-[collapsible=icon]:hidden">
          <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent-purple grid place-items-center text-white text-sm font-semibold shrink-0">
            {currentUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-sidebar-foreground truncate">{currentUser.name}</div>
            <div className="text-[11px] text-sidebar-foreground/55 truncate">
              {currentUser.company} · {currentUser.stage}
            </div>
            <div className="mt-1.5 text-[11px] text-sidebar-foreground/55">
              Trust Score <span className="text-sidebar-foreground font-semibold">{currentUser.trustScore}</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
