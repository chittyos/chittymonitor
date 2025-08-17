import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Activity, GitBranch, Play, AlertTriangle, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Workflow } from "@shared/schema";

interface WorkflowStats {
  totalWorkflows: number;
  workflowsByStatus: { status: string; count: number; percentage: number; }[];
  workflowsByType: { type: string; count: number; percentage: number; }[];
  recentWorkflows: Workflow[];
}

const statusIcons = {
  success: CheckCircle,
  failed: XCircle,
  running: Clock,
  pending: Play,
} as const;

const statusColors = {
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30", 
  running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
} as const;

const typeIcons = {
  deployment: Zap,
  build: Activity,
  test: CheckCircle,
  security: AlertTriangle,
} as const;

export function ChittyFlowSection() {
  const { data: workflowStats, isLoading } = useQuery<WorkflowStats>({
    queryKey: ["/api/workflows/stats"],
    refetchInterval: 30000,
  });

  const { data: workflows = [] } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">ChittyFlow Workflows</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const successRate = workflowStats?.workflowsByStatus.find(s => s.status === 'success')?.percentage || 0;
  const failureRate = workflowStats?.workflowsByStatus.find(s => s.status === 'failed')?.percentage || 0;
  const runningCount = workflowStats?.workflowsByStatus.find(s => s.status === 'running')?.count || 0;

  return (
    <div className="space-y-6" data-testid="chittyflow-section">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-chitty-green" />
          ChittyFlow Workflows
        </h2>
        <Button 
          variant="outline" 
          className="border-chitty-green text-chitty-green hover:bg-chitty-green hover:text-black"
          data-testid="button-sync-workflows"
        >
          <Activity className="w-4 h-4 mr-2" />
          Sync Workflows
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Workflows</p>
                <p className="text-2xl font-bold text-white" data-testid="text-total-workflows">
                  {workflowStats?.totalWorkflows || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-chitty-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-green-400" data-testid="text-success-rate">
                  {successRate.toFixed(0)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <Progress value={successRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Running Now</p>
                <p className="text-2xl font-bold text-blue-400" data-testid="text-running-workflows">
                  {runningCount}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Failure Rate</p>
                <p className="text-2xl font-bold text-red-400" data-testid="text-failure-rate">
                  {failureRate.toFixed(0)}%
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <Progress value={failureRate} className="mt-2 h-2 bg-gray-700" />
          </CardContent>
        </Card>
      </div>

      {/* Workflow Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-chitty-green" />
              Workflow Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflowStats?.workflowsByType.map((type) => {
              const IconComponent = typeIcons[type.type as keyof typeof typeIcons] || Activity;
              return (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-chitty-green" />
                    <span className="text-gray-300 capitalize">{type.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{type.count}</span>
                    <div className="w-20">
                      <Progress value={type.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-400 w-10">
                      {type.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-chitty-green" />
              Recent Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflowStats?.recentWorkflows.slice(0, 5).map((workflow) => {
              const StatusIcon = statusIcons[workflow.status as keyof typeof statusIcons] || Clock;
              const statusColor = statusColors[workflow.status as keyof typeof statusColors] || statusColors.pending;
              
              return (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                  data-testid={`workflow-${workflow.id}`}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-4 h-4" />
                    <div>
                      <p className="text-white font-medium text-sm">{workflow.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${statusColor}`}
                        >
                          {workflow.status}
                        </Badge>
                        {workflow.branch && (
                          <span className="text-xs text-gray-400">
                            <GitBranch className="w-3 h-3 inline mr-1" />
                            {workflow.branch}
                          </span>
                        )}
                        {workflow.duration && (
                          <span className="text-xs text-gray-400">
                            {workflow.duration}s
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}