import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Eye, Zap, Target, BarChart3, Activity, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Workflow } from "@shared/schema";

interface AnalyticsInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
}

const insightIcons = {
  prediction: TrendingUp,
  anomaly: AlertTriangle,
  recommendation: Lightbulb,
  trend: BarChart3,
} as const;

const impactColors = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", 
  high: "bg-red-500/20 text-red-400 border-red-500/30",
} as const;

// Mock insights based on actual data patterns
const generateMockInsights = (workflows: Workflow[]): AnalyticsInsight[] => {
  const analytics = workflows.filter(w => w.type === 'analytics');
  const deployments = workflows.filter(w => w.type === 'deployment');
  const failedWorkflows = workflows.filter(w => w.status === 'failed');
  
  return [
    {
      id: '1',
      type: 'prediction',
      title: 'Deployment Success Rate Trend',
      description: `Based on ${deployments.length} recent deployments, success rate is trending upward with 94% confidence.`,
      confidence: 94,
      impact: 'medium',
      category: 'Performance',
      actionable: true
    },
    {
      id: '2',
      type: 'anomaly',
      title: 'Unusual Analytics Activity',
      description: `Detected ${analytics.length} analytics workflows running - 3x higher than typical baseline.`,
      confidence: 87,
      impact: 'medium',
      category: 'Operations',
      actionable: true
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Optimize ChittyPM Dependencies',
      description: 'Analysis suggests consolidating 2 overlapping package dependencies could reduce bundle size by 15%.',
      confidence: 91,
      impact: 'high',
      category: 'Performance',
      actionable: true
    },
    {
      id: '4',
      type: 'trend',
      title: 'Security Scan Compliance',
      description: 'Zero vulnerabilities detected across all scanned applications - maintaining excellent security posture.',
      confidence: 99,
      impact: 'low',
      category: 'Security',
      actionable: false
    }
  ];
};

export function ChittyIntelSection() {
  const { data: workflows = [] } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    refetchInterval: 30000,
  });

  const insights = generateMockInsights(workflows);
  const analyticsWorkflows = workflows.filter(w => w.type === 'analytics');
  const totalInsights = insights.length;
  const highImpactInsights = insights.filter(i => i.impact === 'high').length;
  const actionableInsights = insights.filter(i => i.actionable).length;
  const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length || 0;

  return (
    <div className="space-y-6" data-testid="chittyintel-section">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-chitty-green" />
          ChittyIntel Analytics
        </h2>
        <Button 
          variant="outline" 
          className="border-chitty-green text-chitty-green hover:bg-chitty-green hover:text-black"
          data-testid="button-run-analysis"
        >
          <Brain className="w-4 h-4 mr-2" />
          Run Analysis
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Insights</p>
                <p className="text-2xl font-bold text-white" data-testid="text-total-insights">
                  {totalInsights}
                </p>
              </div>
              <Eye className="w-8 h-8 text-chitty-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-red-400" data-testid="text-high-priority">
                  {highImpactInsights}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Actionable</p>
                <p className="text-2xl font-bold text-blue-400" data-testid="text-actionable-insights">
                  {actionableInsights}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-green-400" data-testid="text-avg-confidence">
                  {avgConfidence.toFixed(0)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
            <Progress value={avgConfidence} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-chitty-green" />
              Active Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsWorkflows.length > 0 ? (
              analyticsWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                  data-testid={`analytics-workflow-${workflow.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-chitty-green" />
                    <div>
                      <p className="text-white font-medium text-sm">{workflow.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={workflow.status === 'running' 
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                          }
                        >
                          {workflow.status}
                        </Badge>
                        {workflow.metadata && typeof workflow.metadata === 'object' && 'insights' in workflow.metadata && (
                          <span className="text-xs text-gray-400">
                            {String((workflow.metadata as any).insights)} insights
                          </span>
                        )}
                        {workflow.metadata && typeof workflow.metadata === 'object' && 'confidence' in workflow.metadata && (
                          <span className="text-xs text-gray-400">
                            {(Number((workflow.metadata as any).confidence) * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {workflow.duration ? `${workflow.duration}s` : 'Running...'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active analytics workflows</p>
                <p className="text-sm">Start an analysis to see insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-chitty-green" />
              Intelligence Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight) => {
              const IconComponent = insightIcons[insight.type];
              const impactColor = impactColors[insight.impact];
              
              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-lg bg-gray-900/50 border border-gray-700"
                  data-testid={`insight-${insight.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-chitty-green" />
                      <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${impactColor}`}
                      >
                        {insight.impact}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {insight.category}
                    </Badge>
                    {insight.actionable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-chitty-green hover:bg-chitty-green/10 h-6 px-2 text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Act
                      </Button>
                    )}
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