import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUsername(data.username || data.full_name || user.email?.split('@')[0] || 'User');
      } else if (!error) {
        // Fallback to email username part
        setUsername(user.email?.split('@')[0] || 'User');
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <div className="dark min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">
            <header className="h-16 flex items-center justify-between border-b border-border px-6">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{username}</span>
                </div>
                <Button
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </header>
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}