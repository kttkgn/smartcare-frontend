import Mock from 'mockjs';

// 定义Mock请求选项类型
interface MockRequestOptions {
  url: string;
  type: string;
  body?: string;
}

// 生成日期范围内的数据
function generateDateRangeData(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  let current = new Date(start);
  while (current <= end) {
    data.push({
      date: current.toISOString().split('T')[0],
      value: Mock.Random.integer(10, 100)
    });
    
    switch (groupBy) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return data;
}

export function analyticsMock() {
  // 获取会话统计
  Mock.mock(/\/api\/v1\/analytics\/sessions/, 'get', (options: MockRequestOptions) => {
    const url = new URL(options.url, 'http://localhost');
    const startDate = url.searchParams.get('start_date') || '2024-01-01';
    const endDate = url.searchParams.get('end_date') || '2024-12-31';
    const groupBy = (url.searchParams.get('group_by') || 'day') as 'day' | 'week' | 'month';
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        total_sessions: Mock.Random.integer(1000, 5000),
        active_sessions: Mock.Random.integer(10, 100),
        closed_sessions: Mock.Random.integer(900, 4900),
        avg_duration: Mock.Random.integer(5, 30),
        avg_response_time: Mock.Random.integer(1, 10),
        by_date: generateDateRangeData(startDate, endDate, groupBy)
      }
    };
  });

  // 获取用户满意度统计
  Mock.mock(/\/api\/v1\/analytics\/satisfaction/, 'get', (options: MockRequestOptions) => {
    const url = new URL(options.url, 'http://localhost');
    const startDate = url.searchParams.get('start_date') || '2024-01-01';
    const endDate = url.searchParams.get('end_date') || '2024-12-31';
    const groupBy = (url.searchParams.get('group_by') || 'day') as 'day' | 'week' | 'month';
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        total_ratings: Mock.Random.integer(1000, 5000),
        avg_rating: Mock.Random.float(3.5, 5, 1, 2),
        rating_distribution: Array(5).fill(0).map((_, index) => ({
          rating: index + 1,
          count: Mock.Random.integer(100, 1000)
        })),
        by_date: generateDateRangeData(startDate, endDate, groupBy).map(item => ({
          date: item.date,
          avg_rating: Mock.Random.float(3.5, 5, 1, 2)
        }))
      }
    };
  });

  // 获取FAQ使用统计
  Mock.mock(/\/api\/v1\/analytics\/faqs/, 'get', (options: MockRequestOptions) => {
    const url = new URL(options.url, 'http://localhost');
    const startDate = url.searchParams.get('start_date') || '2024-01-01';
    const endDate = url.searchParams.get('end_date') || '2024-12-31';
    const faqId = url.searchParams.get('faq_id');
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        total_views: Mock.Random.integer(5000, 10000),
        total_helpful: Mock.Random.integer(3000, 8000),
        helpful_rate: Mock.Random.float(0.6, 0.9, 2, 2),
        by_faq: Array(10).fill(0).map((_, index) => ({
          faq_id: index + 1,
          question: Mock.Random.ctitle(10, 20),
          views: Mock.Random.integer(100, 1000),
          helpful: Mock.Random.integer(50, 800)
        }))
      }
    };
  });

  // 获取客服工作量统计
  Mock.mock(/\/api\/v1\/analytics\/agent-workload/, 'get', (options: MockRequestOptions) => {
    const url = new URL(options.url, 'http://localhost');
    const startDate = url.searchParams.get('start_date') || '2024-01-01';
    const endDate = url.searchParams.get('end_date') || '2024-12-31';
    const agentId = url.searchParams.get('agent_id');
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        total_sessions: Mock.Random.integer(1000, 5000),
        avg_response_time: Mock.Random.integer(1, 10),
        avg_rating: Mock.Random.float(3.5, 5, 1, 2),
        by_agent: Array(5).fill(0).map((_, index) => ({
          agent_id: index + 1,
          agent_name: Mock.Random.cname(),
          sessions: Mock.Random.integer(100, 1000),
          avg_response_time: Mock.Random.integer(1, 10),
          avg_rating: Mock.Random.float(3.5, 5, 1, 2)
        }))
      }
    };
  });
} 