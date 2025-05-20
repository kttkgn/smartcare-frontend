import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAnalytics } from '@/api/analytics';
import { ElMessage } from 'element-plus';

// 定义数据类型
interface AnalyticsData {
  totalSessions: number;
  activeSessions: number;
  avgResponseTime: number;
  satisfactionRate: number;
  sessionTrend: Array<{ date: string; count: number }>;
  questionCategories: Array<{ category: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
  agentPerformance: Array<{
    name: string;
    sessionCount: number;
    avgResponseTime: number;
    satisfactionRate: number;
  }>;
}

// 模拟数据
const mockAnalyticsData: AnalyticsData = {
  totalSessions: 1234,
  activeSessions: 56,
  avgResponseTime: 2.5,
  satisfactionRate: 95,
  sessionTrend: [
    { date: '2024-03-01', count: 120 },
    { date: '2024-03-02', count: 132 },
    { date: '2024-03-03', count: 101 },
    { date: '2024-03-04', count: 134 },
    { date: '2024-03-05', count: 90 },
    { date: '2024-03-06', count: 230 },
    { date: '2024-03-07', count: 210 },
    { date: '2024-03-08', count: 180 },
    { date: '2024-03-09', count: 160 },
    { date: '2024-03-10', count: 190 },
    { date: '2024-03-11', count: 220 },
    { date: '2024-03-12', count: 240 },
    { date: '2024-03-13', count: 210 },
    { date: '2024-03-14', count: 230 },
  ],
  questionCategories: [
    { category: '产品咨询', count: 450 },
    { category: '技术支持', count: 320 },
    { category: '售后服务', count: 280 },
    { category: '投诉建议', count: 120 },
    { category: '其他', count: 64 },
  ],
  peakHours: [
    { hour: 8, count: 80 },
    { hour: 9, count: 120 },
    { hour: 10, count: 180 },
    { hour: 11, count: 210 },
    { hour: 12, count: 150 },
    { hour: 13, count: 90 },
    { hour: 14, count: 160 },
    { hour: 15, count: 190 },
    { hour: 16, count: 170 },
    { hour: 17, count: 140 },
    { hour: 18, count: 100 },
    { hour: 19, count: 70 },
  ],
  agentPerformance: [
    { name: '张三', sessionCount: 320, avgResponseTime: 2.1, satisfactionRate: 96 },
    { name: '李四', sessionCount: 280, avgResponseTime: 2.3, satisfactionRate: 94 },
    { name: '王五', sessionCount: 250, avgResponseTime: 2.5, satisfactionRate: 93 },
    { name: '赵六', sessionCount: 220, avgResponseTime: 2.4, satisfactionRate: 95 },
    { name: '钱七', sessionCount: 180, avgResponseTime: 2.6, satisfactionRate: 92 },
  ],
};

export const useAnalyticsStore = defineStore('analytics', () => {
  const analyticsData = ref<AnalyticsData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAnalytics = async () => {
    loading.value = true;
    error.value = null;
    try {
      // 使用模拟数据
      analyticsData.value = mockAnalyticsData;
      // 实际API调用
      // const response = await getAnalytics();
      // analyticsData.value = response.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取数据失败';
      console.error('获取统计数据失败:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    analyticsData,
    loading,
    error,
    fetchAnalytics,
  };
}); 