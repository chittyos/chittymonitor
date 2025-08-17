import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TopNavigation() {
  return (
    <nav className="bg-chitty-dark-secondary border-b border-chitty-border" data-testid="nav-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-chitty-green/10 rounded-lg flex items-center justify-center">
                <span className="text-chitty-green font-bold">CB</span>
              </div>
              <span className="text-xl font-bold" data-testid="text-app-name">ChittyBeacon</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 bg-chitty-dark px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-chitty-green rounded-full animate-pulse"></div>
              <span className="text-sm text-chitty-text-secondary" data-testid="text-live-apps-count">
                24 apps online
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-chitty-text-secondary hover:text-white"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-chitty-dark px-3 py-2 rounded-lg transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-chitty-green text-chitty-dark text-sm font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm" data-testid="text-user-name">John Doe</span>
              <ChevronDown className="h-4 w-4 text-chitty-text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
