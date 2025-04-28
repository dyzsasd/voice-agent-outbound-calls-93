
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, LogIn, LogOut, User, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Logout Error", {
          description: error.message,
        });
        return;
      }

      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Logout Error", {
        description: "An unexpected error occurred during logout.",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background-gray">
        <Sidebar>
          <SidebarContent>
            <div className="p-6">
              <h1 className="text-xl font-bold text-primary">VoiceAgent</h1>
              <p className="text-xs text-neutral mt-1">Intelligent Voice Calls</p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/" className={location.pathname === "/" ? "text-primary" : ""}>
                        <Home />
                        <span>Home</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {user ? (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/profile" className={location.pathname === "/profile" ? "text-primary" : ""}>
                            <User />
                            <span>My Agents</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="#" className={location.pathname === "/settings" ? "text-primary" : ""}>
                            <Settings />
                            <span>Settings</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout}>
                          <LogOut />
                          <span>Logout</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/auth" className={location.pathname === "/auth" ? "text-primary" : ""}>
                          <LogIn />
                          <span>Sign In</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <SidebarTrigger className="h-10 w-10" />
            {user && (
              <div className="flex items-center gap-4">
                <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            )}
          </div>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
