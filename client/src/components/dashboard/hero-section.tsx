import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Zap, Activity, TrendingUp, ChevronRight, Signal } from "lucide-react";
import { Stats } from "@/lib/types";
import { chittyID } from "@/lib/chittyid";
import heroImage from "@assets/image_1754421459088.png";

export default function HeroSection() {
  const [connecting, setConnecting] = useState(false);
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const handleConnectChittyID = () => {
    if (chittyID.isConnected()) {
      // Already connected, maybe show profile or disconnect option
      return;
    }
    
    setConnecting(true);
    try {
      chittyID.connect(); // This will redirect to ChittyID OAuth
    } catch (error) {
      console.error('Failed to connect to ChittyID:', error);
      setConnecting(false);
    }
  };

  const liveMetrics = [
    {
      value: stats?.totalApps || 0,
      label: "Apps",
      progress: 100,
      color: "text-chitty-green"
    },
    {
      value: stats?.activeApps || 0, 
      label: "Active",
      progress: stats && stats.totalApps > 0 ? (stats.activeApps / stats.totalApps) * 100 : 0,
      color: "text-chitty-green"
    },
    {
      value: `${Math.round(stats?.avgUptime || 0)}%`,
      label: "Uptime",
      progress: stats?.avgUptime || 0,
      color: "text-green-400"
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-chitty-dark via-chitty-dark to-chitty-dark-secondary border-b border-chitty-border">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--chitty-green)) 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Signal className="h-8 w-8 text-chitty-green" />
                  <h1 className="text-4xl font-bold">
                    <span className="text-white">ChittyBeacon</span>
                    <span className="text-chitty-green ml-2">Live</span>
                  </h1>
                </div>
                <Badge className="bg-chitty-green/10 text-chitty-green border-chitty-green/20">
                  <Activity className="mr-1 h-3 w-3 animate-pulse" />
                  Real-time
                </Badge>
              </div>

              <p className="text-xl text-chitty-text-secondary leading-relaxed">
                Monitor all your connected apps in real-time. Dead simple tracking with 
                <span className="text-chitty-green font-medium"> ChittyID sync</span>, 
                live metrics, and instant notifications.
              </p>
            </div>

            {/* Live Metrics Display */}
            <div className="bg-chitty-dark-secondary/50 backdrop-blur-sm rounded-2xl p-6 border border-chitty-border/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-chitty-text-secondary uppercase tracking-wider">Live Metrics</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-chitty-green rounded-full animate-pulse"></div>
                  <span className="text-xs text-chitty-green">LIVE</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {liveMetrics.map((metric, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className={`text-3xl font-bold ${metric.color}`} data-testid={`hero-metric-${metric.label.toLowerCase()}-value`}>
                      {metric.value}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-chitty-text-secondary uppercase tracking-wider">{metric.label}</div>
                      <Progress 
                        value={metric.progress} 
                        className="h-1"
                        style={{
                          '--progress-background': `hsl(var(--chitty-dark))`,
                          '--progress-foreground': `hsl(var(--chitty-green))`
                        } as React.CSSProperties}
                        data-testid={`hero-progress-${metric.label.toLowerCase()}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ChittyID Connection */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleConnectChittyID}
                disabled={connecting}
                className="bg-chitty-green hover:bg-chitty-green-dark text-chitty-dark font-semibold px-8 py-3 text-lg"
                data-testid="button-hero-connect-chittyid"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-chitty-dark border-t-transparent mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Connect ChittyID
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                className="border-chitty-border hover:bg-chitty-dark text-white px-6 py-3"
                data-testid="button-hero-quick-start"
              >
                Quick Start
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-chitty-border">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-chitty-green" />
                <span className="text-sm text-chitty-text-secondary">Instant Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-chitty-text-secondary">Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm text-chitty-text-secondary">Privacy First</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-chitty-text-secondary">Smart Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-chitty-border/30 bg-chitty-dark-secondary/30 backdrop-blur-sm">
              <img 
                src={heroImage} 
                alt="ChittyBeacon Dashboard Preview" 
                className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                data-testid="hero-preview-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chitty-dark/20 to-transparent"></div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-chitty-dark-secondary border border-chitty-border rounded-xl p-4 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-chitty-green rounded-full animate-pulse"></div>
                <div>
                  <div className="text-sm font-medium text-white">{stats?.activeApps || 0} Apps Online</div>
                  <div className="text-xs text-chitty-text-secondary">Monitoring live</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}