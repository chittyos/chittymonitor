import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppEvent } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const eventColors = {
  startup: "bg-chitty-green",
  shutdown: "bg-orange-400",
  heartbeat: "bg-blue-400",
  error: "bg-red-400",
};

export default function RecentActivity() {
  const { data: events, isLoading } = useQuery<AppEvent[]>({
    queryKey: ["/api/events"],
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <Card className="bg-chitty-dark-secondary border-chitty-border">
        <CardHeader>
          <CardTitle className="animate-pulse bg-chitty-border h-6 w-32 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-2 h-2 bg-chitty-border rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="bg-chitty-border h-4 w-24 rounded mb-1"></div>
                  <div className="bg-chitty-border h-3 w-32 rounded mb-1"></div>
                  <div className="bg-chitty-border h-3 w-20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-chitty-dark-secondary border-chitty-border" data-testid="card-recent-activity">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" data-testid="text-recent-activity-title">
          Recent Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {!events || events.length === 0 ? (
            <div className="text-center py-8 text-chitty-text-secondary" data-testid="text-no-activity">
              No recent activity
            </div>
          ) : (
            events.slice(0, 6).map((event) => {
              const colorClass = eventColors[event.event as keyof typeof eventColors] || eventColors.heartbeat;
              
              return (
                <div key={event.id} className="flex items-start space-x-3" data-testid={`activity-${event.id}`}>
                  <div className={`w-2 h-2 ${colorClass} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" data-testid={`text-activity-${event.id}-app`}>
                      {event.appId}
                    </p>
                    <p className="text-xs text-chitty-text-secondary" data-testid={`text-activity-${event.id}-event`}>
                      {event.event.charAt(0).toUpperCase() + event.event.slice(1)}
                    </p>
                    <p className="text-xs text-chitty-text-secondary" data-testid={`text-activity-${event.id}-time`}>
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </p>
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
