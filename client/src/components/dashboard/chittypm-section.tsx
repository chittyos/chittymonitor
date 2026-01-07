import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Download, Zap, Clock, ExternalLink } from "lucide-react";

interface ChittyPMStats {
  totalPackages: number;
  packagesByManager: { manager: string; count: number; percentage: number; }[];
  recentInstalls: Array<{
    id: string;
    name: string;
    version: string;
    manager: string;
    description: string;
    downloadCount: number;
    size: number;
    installedAt: string;
  }>;
}

export function ChittyPMSection() {
  const { data: packageStats, isLoading } = useQuery<ChittyPMStats>({
    queryKey: ["/api/packages/stats"],
    refetchInterval: 30000,
  });

  const { data: allPackages } = useQuery<Array<{
    id: string;
    name: string;
    version: string;
    manager: string;
    description: string;
    downloadCount: number;
    size: number;
  }>>({
    queryKey: ["/api/packages"],
    refetchInterval: 60000,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card data-testid="chittypm-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-chitty-green" />
            ChittyPM Package Manager
          </CardTitle>
          <CardDescription>
            Loading package management data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!packageStats) {
    return (
      <Card data-testid="chittypm-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-chitty-green" />
            ChittyPM Package Manager
          </CardTitle>
          <CardDescription>
            No package data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="chittypm-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-chitty-green">ChittyPM Integration</h2>
          <p className="text-muted-foreground">
            Package management across your ChittyOS applications
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          data-testid="button-sync-packages"
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Sync Packages
        </Button>
      </div>

      {/* Package Manager Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-total-packages">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Total Packages
              <Package className="h-4 w-4 text-chitty-green" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chitty-green">
              {packageStats.totalPackages}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all applications
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-chittypm-packages">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              ChittyPM Packages
              <Zap className="h-4 w-4 text-chitty-green" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chitty-green">
              {packageStats.packagesByManager.find(p => p.manager === 'chittypm')?.count || 0}
            </div>
            <Progress 
              value={packageStats.packagesByManager.find(p => p.manager === 'chittypm')?.percentage || 0} 
              className="mt-2 h-2"
              data-testid="progress-chittypm-percentage"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(packageStats.packagesByManager.find(p => p.manager === 'chittypm')?.percentage || 0).toFixed(1)}% of total packages
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-package-managers">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Package Managers
              <Download className="h-4 w-4 text-chitty-green" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packageStats.packagesByManager.slice(0, 3).map((manager, index) => (
                <div key={manager.manager} className="flex items-center justify-between text-sm">
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    data-testid={`badge-manager-${manager.manager}`}
                  >
                    {manager.manager}
                  </Badge>
                  <span className="text-muted-foreground">{manager.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Package Installs */}
      <Card data-testid="card-recent-installs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-chitty-green" />
            Recent Package Installs
          </CardTitle>
          <CardDescription>
            Latest packages installed across your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packageStats.recentInstalls.slice(0, 5).map((pkg) => (
              <div 
                key={pkg.id}
                className="flex items-center justify-between p-4 bg-card/50 rounded-lg border"
                data-testid={`package-item-${pkg.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-chitty-green/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-chitty-green" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm" data-testid={`text-package-name-${pkg.id}`}>
                        {pkg.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        v{pkg.version}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {pkg.manager}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                      {pkg.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-medium" data-testid={`text-downloads-${pkg.id}`}>
                      {formatNumber(pkg.downloadCount)}
                    </p>
                    <p className="text-xs text-muted-foreground">downloads</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" data-testid={`text-size-${pkg.id}`}>
                      {formatBytes(pkg.size)}
                    </p>
                    <p className="text-xs text-muted-foreground">size</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`button-view-package-${pkg.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {packageStats.recentInstalls.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No packages installed yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Packages will appear here when installed through ChittyPM
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}