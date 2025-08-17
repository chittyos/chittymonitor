export interface App {
  id: string;
  userId: string;
  name: string;
  version: string;
  platform: string;
  environment?: string;
  hostname?: string;
  nodeVersion?: string;
  os?: string;
  hasClaudeCode: boolean;
  hasGit: boolean;
  gitInfo?: {
    branch: string;
    commit: string;
    remote: string;
  };
  platformInfo?: {
    replit?: {
      id: string;
      slug: string;
      owner: string;
      url: string;
    };
    github?: {
      repository: string;
      workflow?: string;
      run_id?: string;
      actor?: string;
    };
    vercel?: {
      url: string;
      env: string;
      region: string;
    };
  };
  status: 'online' | 'offline' | 'error';
  startedAt: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppEvent {
  id: string;
  appId: string;
  event: string;
  timestamp: string;
  data?: any;
  createdAt: string;
}

export interface Stats {
  totalApps: number;
  activeApps: number;
  claudeApps: number;
  avgUptime: number;
  platformDistribution: {
    platform: string;
    count: number;
    percentage: number;
  }[];
}

export interface PlatformDistribution {
  platform: string;
  count: number;
  percentage: number;
  color: string;
}
