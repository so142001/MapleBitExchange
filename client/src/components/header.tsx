import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { AdminLoginModal } from "./admin-login-modal";
import { useLocation } from "wouter";

export function Header() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [location] = useLocation();

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
              <Button 
                onClick={() => setShowAdminModal(true)}
                className="bg-primary text-white hover:bg-blue-700"
              >
                Admin
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-500">
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <AdminLoginModal 
        open={showAdminModal} 
        onOpenChange={setShowAdminModal}
      />
    </>
  );
}
