import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Server, Activity, Bot, Clock } from "lucide-react";
import { Stats } from "@/lib/types";

export default function MetricsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-chitty-dark-secondary border-chitty-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-chitty-border rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-chitty-border rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-chitty-border rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Apps",
      value: stats?.totalApps || 0,
      progress: 100,
      icon: Server,
      color: "text-chitty-green",
      bgColor: "bg-chitty-green",
    },
    {
      title: "Active Now", 
      value: stats?.activeApps || 0,
      progress: stats && stats.totalApps > 0 ? (stats.activeApps / stats.totalApps) * 100 : 0,
      icon: Activity,
      color: "text-chitty-green",
      bgColor: "bg-chitty-green",
      pulse: true,
    },
    {
      title: "Claude Code",
      value: stats?.claudeApps || 0,
      progress: stats && stats.totalApps > 0 ? (stats.claudeApps / stats.totalApps) * 100 : 0,
      icon: Bot,
      color: "text-blue-400",
      bgColor: "bg-blue-400",
    },
    {
      title: "Uptime",
      value: `${stats?.avgUptime?.toFixed(0) || 0}%`,
      progress: stats?.avgUptime || 0,
      icon: Clock,
      color: "text-green-400",
      bgColor: "bg-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="metrics-overview">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="bg-chitty-dark-secondary border-chitty-border overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                  {metric.pulse && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-chitty-green rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-0" data-testid={`text-${metric.title.toLowerCase().replace(/\s+/g, '-')}-value`}>
                    {metric.value}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-chitty-text-secondary uppercase tracking-wider" data-testid={`text-${metric.title.toLowerCase().replace(/\s+/g, '-')}-title`}>
                  {metric.title}
                </h3>
                <Progress 
                  value={metric.progress} 
                  className="h-1"
                  style={{
                    '--progress-background': `hsl(var(--chitty-dark))`,
                    '--progress-foreground': metric.bgColor === 'bg-chitty-green' ? 'hsl(var(--chitty-green))' : 
                                           metric.bgColor === 'bg-blue-400' ? 'hsl(200, 100%, 50%)' : 
                                           metric.bgColor === 'bg-green-400' ? 'hsl(120, 100%, 50%)' : 'hsl(var(--chitty-green))'
                  } as React.CSSProperties}
                  data-testid={`progress-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
