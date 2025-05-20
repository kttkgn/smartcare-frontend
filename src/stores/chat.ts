import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message, Session } from '@/types';
import { chatApi } from '@/api';
import { ElMessage } from 'element-plus';

// 模拟数据
const mockSessions: Session[] = [
  {
    id: 1,
    user_id: 1001,
    agent_id: 1,
    status: 'active',
    started_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    user_id: 1002,
    agent_id: 1,
    status: 'active',
    started_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    user_id: 1003,
    agent_id: 1,
    status: 'closed',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    ended_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      session_id: 1,
      sender_type: 'user',
      sender_id: 1001,
      content: '你好，我有一个问题想咨询',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      session_id: 1,
      sender_type: 'agent',
      sender_id: 1,
      content: '您好，很高兴为您服务，请问有什么可以帮您？',
      created_at: new Date(Date.now() - 3590000).toISOString(),
    },
    {
      id: 3,
      session_id: 1,
      sender_type: 'user',
      sender_id: 1001,
      content: '我想了解一下你们的产品',
      created_at: new Date(Date.now() - 3580000).toISOString(),
    },
  ],
  2: [
    {
      id: 4,
      session_id: 2,
      sender_type: 'user',
      sender_id: 1002,
      content: '我的订单状态怎么查询？',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 5,
      session_id: 2,
      sender_type: 'agent',
      sender_id: 1,
      content: '您可以在订单页面输入订单号进行查询',
      created_at: new Date(Date.now() - 7190000).toISOString(),
    },
  ],
  3: [
    {
      id: 6,
      session_id: 3,
      sender_type: 'user',
      sender_id: 1003,
      content: '退款流程是怎样的？',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 7,
      session_id: 3,
      sender_type: 'agent',
      sender_id: 1,
      content: '您可以在订单详情页点击退款按钮，按照提示操作即可',
      created_at: new Date(Date.now() - 86300000).toISOString(),
    },
    {
      id: 8,
      session_id: 3,
      sender_type: 'user',
      sender_id: 1003,
      content: '好的，谢谢',
      created_at: new Date(Date.now() - 86200000).toISOString(),
    },
  ],
};

export const useChatStore = defineStore('chat', () => {
  const currentSession = ref<Session | null>(null);
  const messages = ref<Message[]>([]);
  const sessions = ref<Session[]>(mockSessions);
  const ws = ref<WebSocket | null>(null);

  const createSession = async (userId: number) => {
    try {
      // 模拟创建会话
      const newSession: Session = {
        id: sessions.value.length + 1,
        user_id: userId,
        agent_id: 1,
        status: 'active',
        started_at: new Date().toISOString(),
      };
      sessions.value.push(newSession);
      currentSession.value = newSession;
      messages.value = [];
      connectWebSocket();
      return newSession;
    } catch (error) {
      ElMessage.error('创建会话失败');
      return null;
    }
  };

  const fetchSessions = async () => {
    try {
      // 使用模拟数据
      sessions.value = mockSessions;
    } catch (error) {
      ElMessage.error('获取会话列表失败');
    }
  };

  const fetchMessages = async () => {
    if (!currentSession.value) return;
    try {
      // 使用模拟数据
      messages.value = mockMessages[currentSession.value.id] || [];
    } catch (error) {
      ElMessage.error('获取消息历史失败');
    }
  };

  const sendMessage = async (data: { session_id: number; content: string }) => {
    if (!currentSession.value) return;
    try {
      // 模拟发送消息
      const newMessage: Message = {
        id: messages.value.length + 1,
        session_id: data.session_id,
        sender_type: 'agent',
        sender_id: 1,
        content: data.content,
        created_at: new Date().toISOString(),
      };
      messages.value.push(newMessage);
      return newMessage;
    } catch (error) {
      ElMessage.error('发送消息失败');
      return null;
    }
  };

  const endSession = async (sessionId: number) => {
    try {
      // 模拟结束会话
      const session = sessions.value.find(s => s.id === sessionId);
      if (session) {
        session.status = 'closed';
        session.ended_at = new Date().toISOString();
      }
      if (currentSession.value?.id === sessionId) {
        currentSession.value = null;
        messages.value = [];
      }
    } catch (error) {
      ElMessage.error('结束会话失败');
    }
  };

  const connectWebSocket = () => {
    if (!currentSession.value) return;
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/${currentSession.value.id}`;
    ws.value = new WebSocket(wsUrl);

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data);
      messages.value.push(message);
    };

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error);
      ElMessage.error('WebSocket连接错误');
    };

    ws.value.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  const disconnectWebSocket = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  const clearSession = () => {
    currentSession.value = null;
    messages.value = [];
    disconnectWebSocket();
  };

  return {
    currentSession,
    messages,
    sessions,
    createSession,
    fetchSessions,
    fetchMessages,
    sendMessage,
    endSession,
    connectWebSocket,
    disconnectWebSocket,
    clearSession,
  };
}); 