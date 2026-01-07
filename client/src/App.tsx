import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Apply dark mode to document element immediately
  document.documentElement.classList.add('dark');
  document.body.style.backgroundColor = 'hsl(214, 35%, 6%)';
  document.body.style.color = 'hsl(0, 0%, 98%)';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-chitty-dark text-white" style={{ backgroundColor: 'hsl(214, 35%, 6%)', color: 'hsl(0, 0%, 98%)' }}>
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
