import { Bell, Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/mock-data";

export function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-surface flex items-center gap-3 px-4 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search people, answers, resources…"
          className="pl-9 h-9 bg-elevated border-transparent focus-visible:bg-surface"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary-hover">
          <Plus className="size-4" /> Add recommendation
        </Button>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
        </Button>
        <div className="size-8 rounded-full gradient-agentic grid place-items-center text-white text-xs font-semibold">
          {currentUser.initials}
        </div>
      </div>
    </header>
  );
}
