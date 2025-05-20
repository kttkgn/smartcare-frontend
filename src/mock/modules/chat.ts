import Mock from 'mockjs';
import { generateSession, generateMessage, generatePagination } from '../setup';

// 定义Mock请求选项类型
interface MockRequestOptions {
  url: string;
  type: string;
  body?: string;
}

// 模拟会话数据
const sessions = Array(30).fill(0).map(() => generateSession());

// 模拟消息数据
const messages = new Map<number, any[]>();

// 为每个会话生成消息
sessions.forEach(session => {
  messages.set(session.id, Array(Mock.Random.integer(5, 20))
    .fill(0)
    .map(() => ({
      ...generateMessage(),
      session_id: session.id
    }))
  );
});

export function chatMock() {
  // 创建会话
  Mock.mock(/\/api\/v1\/chat\/sessions/, 'post', (options: MockRequestOptions) => {
    const data = JSON.parse(options.body || '{}');
    const newSession = {
      ...generateSession(),
      ...data,
      id: sessions.length + 1
    };
    sessions.unshift(newSession);
    messages.set(newSession.id, []);
    
    return {
      code: 200,
      message: '创建成功',
      data: newSession
    };
  });

  // 获取会话列表
  Mock.mock(/\/api\/v1\/chat\/sessions(\?.*)?$/, 'get', (options: MockRequestOptions) => {
    const url = new URL(options.url, 'http://localhost');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '10');
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let filteredSessions = [...sessions];

    // 按状态筛选
    if (status) {
      filteredSessions = filteredSessions.filter(session => session.status === status);
    }

    // 按日期筛选
    if (startDate && endDate) {
      filteredSessions = filteredSessions.filter(session => 
        session.created_at >= startDate && session.created_at <= endDate
      );
    }

    return {
      code: 200,
      message: '获取成功',
      data: generatePagination(filteredSessions, page, pageSize)
    };
  });

  // 获取会话详情
  Mock.mock(/\/api\/v1\/chat\/sessions\/\d+/, 'get', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/chat\/sessions\/(\d+)/)?.[1] || '0');
    const session = sessions.find(s => s.id === id);
    
    if (session) {
      return {
        code: 200,
        message: '获取成功',
        data: session
      };
    }
    
    return {
      code: 404,
      message: '会话不存在'
    };
  });

  // 获取会话消息列表
  Mock.mock(/\/api\/v1\/chat\/sessions\/\d+\/messages(\?.*)?$/, 'get', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/chat\/sessions\/(\d+)\/messages/)?.[1] || '0');
    const url = new URL(options.url, 'http://localhost');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const messageType = url.searchParams.get('message_type');

    let sessionMessages = messages.get(id) || [];

    // 按消息类型筛选
    if (messageType) {
      sessionMessages = sessionMessages.filter(msg => msg.message_type === messageType);
    }

    return {
      code: 200,
      message: '获取成功',
      data: generatePagination(sessionMessages, page, pageSize)
    };
  });

  // 发送消息
  Mock.mock(/\/api\/v1\/chat\/messages/, 'post', (options: MockRequestOptions) => {
    const data = JSON.parse(options.body || '{}');
    const newMessage = {
      ...generateMessage(),
      ...data,
      id: messages.get(data.session_id)?.length + 1 || 1
    };
    
    const sessionMessages = messages.get(data.session_id) || [];
    sessionMessages.push(newMessage);
    messages.set(data.session_id, sessionMessages);
    
    return {
      code: 200,
      message: '发送成功',
      data: newMessage
    };
  });

  // 获取AI回复
  Mock.mock(/\/api\/v1\/chat\/ai-response/, 'post', (options: MockRequestOptions) => {
    const data = JSON.parse(options.body || '{}');
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        message: Mock.Random.cparagraph(2, 4),
        suggested_questions: Array(3).fill(0).map(() => Mock.Random.ctitle(10, 20)),
        related_faqs: Array(2).fill(0).map(() => ({
          id: Mock.Random.integer(1, 100),
          question: Mock.Random.ctitle(10, 20),
          answer: Mock.Random.cparagraph(2, 4)
        })),
        confidence: Mock.Random.float(0.5, 1, 2, 2)
      }
    };
  });

  // 关闭会话
  Mock.mock(/\/api\/v1\/chat\/sessions\/\d+\/close/, 'post', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/chat\/sessions\/(\d+)\/close/)?.[1] || '0');
    const data = JSON.parse(options.body || '{}');
    const index = sessions.findIndex(session => session.id === id);
    
    if (index > -1) {
      sessions[index] = {
        ...sessions[index],
        status: 'closed',
        rating: data.rating,
        feedback: data.feedback,
        updated_at: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      };
      
      return {
        code: 200,
        message: '关闭成功'
      };
    }
    
    return {
      code: 404,
      message: '会话不存在'
    };
  });

  // 转接会话
  Mock.mock(/\/api\/v1\/chat\/sessions\/\d+\/transfer/, 'post', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/chat\/sessions\/(\d+)\/transfer/)?.[1] || '0');
    const data = JSON.parse(options.body || '{}');
    const index = sessions.findIndex(session => session.id === id);
    
    if (index > -1) {
      sessions[index] = {
        ...sessions[index],
        status: 'transferred',
        agent_id: data.agent_id,
        updated_at: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      };
      
      return {
        code: 200,
        message: '转接成功'
      };
    }
    
    return {
      code: 404,
      message: '会话不存在'
    };
  });
} 