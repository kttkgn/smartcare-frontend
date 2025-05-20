import request from '@/utils/request';

export interface AnalyticsData {
  totalSessions: number;
  activeSessions: number;
  avgResponseTime: number;
  sessionTrend: {
    date: string;
    count: number;
  }[];
  questionCategories: {
    category: string;
    count: number;
  }[];
  satisfactionRate: number;
  peakHours: {
    hour: number;
    count: number;
  }[];
  agentPerformance: {
    agentId: number;
    name: string;
    sessionCount: number;
    avgResponseTime: number;
    satisfactionRate: number;
  }[];
}

export const analyticsApi = {
  getAnalytics: () => {
    return request.get<AnalyticsData>('/api/v1/analytics');
  },
}; 