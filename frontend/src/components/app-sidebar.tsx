import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, User, UserPlus, Network, LayoutDashboard, Globe2 } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
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
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <img
            src="/delta-triangle-logo-transparent.png"
            alt="Delta Connector"
            className="size-8 object-contain shrink-0"
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">Delta Connector</span>
            <span className="text-[10px] text-sidebar-foreground/60">Connecting founders to the people &amp; resources they need</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-accent-purple grid place-items-center text-white text-xs font-semibold">
            {currentUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</div>
            <div className="text-[11px] text-sidebar-foreground/60 truncate">
              {currentUser.company} · {currentUser.stage} · {currentUser.location}
            </div>
            <div className="mt-1 text-[10px] text-sidebar-foreground/60">
              Trust Score <span className="text-sidebar-foreground font-semibold">{currentUser.trustScore}</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
