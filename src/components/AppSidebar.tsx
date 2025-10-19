// src/components/AppSidebar.tsx - Updated with admin link
import { Home, BookOpen, FlaskConical, Trophy, GraduationCap, Shield } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAdmin } from "@/hooks/useAdmin";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Quiz", url: "/dashboard/quiz", icon: BookOpen },
  { title: "Labs", url: "/dashboard/labs", icon: FlaskConical },
  { title: "Rewards", url: "/dashboard/rewards", icon: Trophy },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar>
      <SidebarContent className="bg-sidebar-background">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <span className="text-sidebar-foreground font-bold text-lg">CryptIQ</span>
            <GraduationCap className="w-6 h-6 text-accent" />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 p-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 rounded-xl">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin Link - Only visible to admins */}
              {isAdmin && (
                <>
                  <div className="my-2 border-t border-sidebar-border" />
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="h-12 rounded-xl">
                      <NavLink to="/admin" className={getNavCls}>
                        <Shield className="h-5 w-5" />
                        <span className="ml-3">Admin Panel</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}