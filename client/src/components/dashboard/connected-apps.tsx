import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Code, GitBranch, Bot } from "lucide-react";
import { App } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function ConnectedApps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps"],
    refetchInterval: 30000,
  });

  const filteredApps = apps?.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "all" || app.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-chitty-green";
      case "offline":
        return "text-orange-400";
      case "error":
        return "text-red-400";
      default:
        return "text-chitty-text-secondary";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "online":
        return "bg-chitty-green";
      case "offline":
        return "bg-orange-400";
      case "error":
        return "bg-red-400";
      default:
        return "bg-chitty-text-secondary";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "replit":
        return "bg-chitty-green/10 text-chitty-green";
      case "github":
        return "bg-blue-400/10 text-blue-400";
      case "vercel":
        return "bg-purple-400/10 text-purple-400";
      case "netlify":
        return "bg-teal-400/10 text-teal-400";
      case "heroku":
        return "bg-purple-600/10 text-purple-600";
      default:
        return "bg-chitty-text-secondary/10 text-chitty-text-secondary";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-chitty-dark-secondary border-chitty-border">
        <CardHeader>
          <CardTitle className="animate-pulse bg-chitty-border h-6 w-32 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-chitty-border rounded">
                <div className="w-12 h-12 bg-chitty-border rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-chitty-border rounded w-1/4"></div>
                  <div className="h-3 bg-chitty-border rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-chitty-dark-secondary border-chitty-border" data-testid="card-connected-apps">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold" data-testid="text-connected-apps-title">
            Connected Apps
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chitty-text-secondary" />
              <Input
                type="text"
                placeholder="Search apps..."
                className="pl-10 bg-chitty-dark border-chitty-border focus:border-chitty-green"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-apps"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40 bg-chitty-dark border-chitty-border" data-testid="select-filter-platform">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="replit">Replit</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="vercel">Vercel</SelectItem>
                <SelectItem value="netlify">Netlify</SelectItem>
                <SelectItem value="heroku">Heroku</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-chitty-text-secondary" data-testid="text-no-apps">
            {searchTerm || platformFilter !== "all" 
              ? "No apps match your filters" 
              : "No connected apps found"
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-chitty-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-chitty-text-secondary">
                    App Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-chitty-text-secondary">
                    Platform
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-chitty-text-secondary">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-chitty-text-secondary">
                    Last Seen
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-chitty-text-secondary">
                    Features
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-chitty-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chitty-border">
                {filteredApps.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-chitty-dark/50 transition-colors"
                    data-testid={`row-app-${app.id}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-chitty-green/20 rounded-lg flex items-center justify-center">
                          <Code className="text-chitty-green text-sm" />
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-app-${app.id}-name`}>
                            {app.name}
                          </p>
                          <p className="text-xs text-chitty-text-secondary" data-testid={`text-app-${app.id}-version`}>
                            v{app.version}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${getPlatformColor(app.platform)} capitalize`} data-testid={`badge-app-${app.id}-platform`}>
                        {app.platform}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${getStatusIndicator(app.status)} rounded-full`}></div>
                        <span className={`text-sm capitalize ${getStatusColor(app.status)}`} data-testid={`text-app-${app.id}-status`}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-chitty-text-secondary" data-testid={`text-app-${app.id}-last-seen`}>
                      {formatDistanceToNow(new Date(app.lastSeen), { addSuffix: true })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {app.hasClaudeCode && (
                          <Badge className="bg-blue-400/10 text-blue-400 text-xs" data-testid={`badge-app-${app.id}-claude`}>
                            <Bot className="mr-1 h-3 w-3" />
                            Claude
                          </Badge>
                        )}
                        {app.hasGit && (
                          <Badge className="bg-purple-400/10 text-purple-400 text-xs" data-testid={`badge-app-${app.id}-git`}>
                            <GitBranch className="mr-1 h-3 w-3" />
                            Git
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-chitty-text-secondary hover:text-white"
                        data-testid={`button-app-${app.id}-actions`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
