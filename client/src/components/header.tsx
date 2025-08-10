import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, LogOut, User, Settings } from "lucide-react";
// import { AdminLoginModal } from "./admin-login-modal";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/");
      window.location.reload(); // Refresh to clear cached user data
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">CAD⟷BTC</h1>
              </div>
              <div className="hidden md:block ml-8">
                <nav className="flex space-x-8">
                  <a 
                    href="#exchange" 
                    className={`font-medium pb-4 ${
                      location === "/" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Exchange
                  </a>
                  <a href="#rates" className="text-gray-500 hover:text-gray-700 pb-4">Rates</a>
                  <a href="#about" className="text-gray-500 hover:text-gray-700 pb-4">About</a>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Heart className="w-6 h-6" />
              </Button>
              
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button 
                      onClick={() => setLocation("/admin")}
                      className="bg-secondary text-white hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{(user as any)?.username || "User"}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-primary text-white hover:bg-blue-700">
                      Register
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-700 text-sm">
                      Admin
                    </Button>
                  </Link>
                </>
              )}
              
              <Button variant="ghost" size="icon" className="md:hidden text-gray-500">
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

    </>
  );
}
