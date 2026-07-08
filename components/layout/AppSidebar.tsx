"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  Settings,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 pb-2">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-sm">
            <Link2 className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-gradient">Snip</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="rounded-lg text-sm transition-all duration-150 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full justify-between rounded-lg px-3 py-5 border border-border/50 bg-card hover:bg-muted/50 transition-all duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {(mounted && user?.email?.charAt(0).toUpperCase()) || "U"}
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-sm font-medium leading-none mb-0.5 truncate">
                        {(mounted && user?.email?.split("@")[0]) || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {(mounted && user?.email) || ""}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-popper-anchor-width] rounded-xl border-border/50 shadow-lg"
              >
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground">
                    {(mounted && user?.email?.split("@")[0]) || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(mounted && user?.email) || ""}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg mx-1 mb-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
