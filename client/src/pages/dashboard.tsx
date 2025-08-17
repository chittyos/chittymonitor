import { useState, useEffect } from "react";
import TopNavigation from "@/components/layout/top-navigation";
import Sidebar from "@/components/layout/sidebar";
import HeroSection from "@/components/dashboard/hero-section";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import PlatformDistribution from "@/components/dashboard/platform-distribution";
import RecentActivity from "@/components/dashboard/recent-activity";
import ConnectedApps from "@/components/dashboard/connected-apps";
import { ChittyPMSection } from "@/components/dashboard/chittypm-section";
import { ChittyFlowSection } from "@/components/dashboard/chittyflow-section";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import QuickSetupModal from "@/components/onboarding/quick-setup-modal";
import { cn } from "@/lib/utils";
import { LayoutGrid, Activity, TrendingUp, Shield, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  useEffect(() => {
    if (isLiveMode) {
      const timer = setInterval(() => {
        window.dispatchEvent(new Event('dashboard-refresh'));
        setLastRefresh(new Date());
      }, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [isLiveMode, refreshInterval]);
  
  const handleManualRefresh = () => {
    window.dispatchEvent(new Event('dashboard-refresh'));
    setLastRefresh(new Date());
  };

  return (
    <div className="bg-chitty-dark text-white min-h-screen">
      <TopNavigation />
      
      <div className="flex">
        <Sidebar onQuickSetup={() => setShowQuickSetup(true)} />
        
        <main className="flex-1" data-testid="main-dashboard">
          <HeroSection />
          
          <div className="p-6">
            {/* Dashboard Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <LayoutGrid className="mr-2 h-6 w-6 text-chitty-green" />
                  Live Dashboard
                </h2>
                <Badge 
                  className={cn(
                    "flex items-center space-x-1",
                    isLiveMode 
                      ? "bg-chitty-green/10 text-chitty-green border-chitty-green/20" 
                      : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  )}
                >
                  <Activity className={cn(
                    "h-3 w-3",
                    isLiveMode && "animate-pulse"
                  )} />
                  <span>{isLiveMode ? 'Live' : 'Paused'}</span>
                </Badge>
                <span className="text-xs text-chitty-text-secondary">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  className="hover:bg-chitty-dark-secondary"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className="border-chitty-border hover:bg-chitty-dark-secondary"
                >
                  {isLiveMode ? 'Pause Updates' : 'Resume Updates'}
                </Button>
                <div className="flex bg-chitty-dark-secondary rounded-lg border border-chitty-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "rounded-r-none",
                      viewMode === 'grid' && "bg-chitty-green/10 text-chitty-green"
                    )}
                  >
                    Grid
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "rounded-l-none",
                      viewMode === 'list' && "bg-chitty-green/10 text-chitty-green"
                    )}
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
            
            <MetricsOverview />
            
            {/* Enhanced Grid Layout */}
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                : "space-y-6 mb-8"
            )}>
              <div className={cn(
                viewMode === 'grid' && "lg:col-span-2"
              )}>
                <PlatformDistribution />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
            
            {/* Performance & Security Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-chitty-dark-secondary border-chitty-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-chitty-green" />
                    Performance Trends
                  </h3>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    Last 7 days
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-chitty-border/30">
                    <span className="text-sm text-chitty-text-secondary">Average Response Time</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">124ms</span>
                      <span className="text-xs text-chitty-green">↓ 12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-chitty-border/30">
                    <span className="text-sm text-chitty-text-secondary">Success Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-chitty-green">99.8%</span>
                      <span className="text-xs text-chitty-green">↑ 0.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-chitty-text-secondary">Total Requests</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">1.2M</span>
                      <span className="text-xs text-blue-400">↑ 15%</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-chitty-dark-secondary border-chitty-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-green-400" />
                    Security Status
                  </h3>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    Secure
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-chitty-border/30">
                    <span className="text-sm text-chitty-text-secondary">SSL Certificates</span>
                    <span className="text-sm font-medium text-green-400">Valid</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-chitty-border/30">
                    <span className="text-sm text-chitty-text-secondary">Security Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">A+</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < 4 ? "bg-green-400" : "bg-chitty-border"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-chitty-text-secondary">Last Scan</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                </div>
              </Card>
            </div>

            <ConnectedApps />

            <div className="mt-8">
              <ChittyPMSection />
            </div>

            <div className="mt-8">
              <ChittyFlowSection />
            </div>
          </div>
        </main>
      </div>

      <OnboardingModal 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <QuickSetupModal 
        open={showQuickSetup} 
        onClose={() => setShowQuickSetup(false)} 
      />
    </div>
  );
}
