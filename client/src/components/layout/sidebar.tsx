import { BarChart3, Server, Satellite, PieChart, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SidebarProps {
  onQuickSetup: () => void;
}

const navigation = [
  { name: "Dashboard", href: "#", icon: BarChart3, current: true },
  { name: "Connected Apps", href: "#", icon: Server, current: false },
  { name: "Beacons", href: "#", icon: Satellite, current: false },
  { name: "Analytics", href: "#", icon: PieChart, current: false },
  { name: "Settings", href: "#", icon: Settings, current: false },
];

export default function Sidebar({ onQuickSetup }: SidebarProps) {
  return (
    <aside className="w-64 bg-chitty-dark-secondary border-r border-chitty-border min-h-screen" data-testid="sidebar">
      <div className="p-6">
        <Card className="bg-chitty-dark border-chitty-green/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" data-testid="text-chittyid-status">ChittyID</span>
              <div className="w-2 h-2 bg-chitty-green rounded-full"></div>
            </div>
            <p className="text-xs text-chitty-text-secondary" data-testid="text-connection-status">
              Connected & Syncing
            </p>
            <Button 
              variant="link" 
              className="text-chitty-green hover:text-chitty-green-dark text-xs p-0 h-auto mt-2"
              data-testid="button-manage-connection"
            >
              Manage Connection
            </Button>
          </CardContent>
        </Card>

        <nav className="space-y-2" data-testid="nav-sidebar">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.current
                    ? "bg-chitty-green/10 text-chitty-green"
                    : "text-chitty-text-secondary hover:text-white hover:bg-chitty-dark"
                }`}
                data-testid={`link-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-chitty-border">
          <Button 
            className="w-full bg-chitty-green hover:bg-chitty-green-dark text-chitty-dark font-semibold"
            onClick={onQuickSetup}
            data-testid="button-add-new-app"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New App
          </Button>
        </div>
      </div>
    </aside>
  );
}
