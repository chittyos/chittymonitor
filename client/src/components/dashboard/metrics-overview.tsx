import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
      subtitle: "+3 this week",
      icon: Server,
      color: "text-chitty-green",
    },
    {
      title: "Active Now",
      value: stats?.activeApps || 0,
      subtitle: `${stats ? Math.round((stats.activeApps / stats.totalApps) * 100) : 0}% uptime`,
      icon: Activity,
      color: "text-chitty-green",
      pulse: true,
    },
    {
      title: "Claude Code",
      value: stats?.claudeApps || 0,
      subtitle: `${stats ? Math.round((stats.claudeApps / stats.totalApps) * 100) : 0}% of apps`,
      icon: Bot,
      color: "text-blue-400",
    },
    {
      title: "Avg Uptime",
      value: `${stats?.avgUptime?.toFixed(1) || 0}%`,
      subtitle: "+2.1% vs last month",
      icon: Clock,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="metrics-overview">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="bg-chitty-dark-secondary border-chitty-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-chitty-text-secondary" data-testid={`text-${metric.title.toLowerCase().replace(/\s+/g, '-')}-title`}>
                  {metric.title}
                </h3>
                <div className="relative">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  {metric.pulse && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-chitty-green rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1" data-testid={`text-${metric.title.toLowerCase().replace(/\s+/g, '-')}-value`}>
                {metric.value}
              </div>
              <div className={`text-sm ${metric.color}`} data-testid={`text-${metric.title.toLowerCase().replace(/\s+/g, '-')}-subtitle`}>
                {metric.subtitle}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
