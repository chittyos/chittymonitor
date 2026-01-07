import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { Stats } from "@/lib/types";

const platformColors = {
  replit: "bg-chitty-green",
  github: "bg-blue-400",
  vercel: "bg-purple-400",
  netlify: "bg-teal-400",
  heroku: "bg-purple-600",
  other: "bg-orange-400",
};

export default function PlatformDistribution() {
  const { data: stats, isLoading, refetch } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="bg-chitty-dark-secondary border-chitty-border">
        <CardHeader>
          <CardTitle className="animate-pulse bg-chitty-border h-6 w-48 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-chitty-border h-4 w-20 rounded"></div>
                  <div className="bg-chitty-border h-4 w-10 rounded"></div>
                </div>
                <div className="bg-chitty-border h-2 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const platforms = stats?.platformDistribution || [];

  return (
    <Card className="bg-chitty-dark-secondary border-chitty-border" data-testid="card-platform-distribution">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold" data-testid="text-platform-distribution-title">
            Platform Distribution
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-chitty-text-secondary hover:text-white"
            onClick={() => refetch()}
            data-testid="button-refresh-platform-data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {platforms.length === 0 ? (
            <div className="text-center py-8 text-chitty-text-secondary" data-testid="text-no-platforms">
              No platform data available
            </div>
          ) : (
            platforms.map((platform) => {
              const colorClass = platformColors[platform.platform as keyof typeof platformColors] || platformColors.other;
              
              return (
                <div key={platform.platform} className="flex items-center justify-between" data-testid={`platform-${platform.platform}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${colorClass} rounded-full`}></div>
                    <span className="font-medium capitalize" data-testid={`text-platform-${platform.platform}-name`}>
                      {platform.platform}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 flex-1 max-w-sm">
                    <Progress 
                      value={platform.percentage} 
                      className="flex-1"
                      data-testid={`progress-platform-${platform.platform}`}
                    />
                    <span 
                      className="text-sm text-chitty-text-secondary w-10 text-right"
                      data-testid={`text-platform-${platform.platform}-percentage`}
                    >
                      {platform.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
