import { get, post, put, del } from '@/utils/request';
import type { User, TokenResponse, FAQ, Session, Message, ChatResponse, SessionStats, SatisfactionStats, FaqStats, AgentWorkloadStats } from '@/types';

// 认证相关接口
export const auth = {
  // 登录获取token
  login: (data: { username: string; password: string }) =>
    post<TokenResponse>('/api/v1/auth/login', data),

  // 刷新token
  refreshToken: (data: { refresh_token: string }) =>
    post<TokenResponse>('/api/v1/auth/refresh', data),

  // 获取当前用户信息
  getCurrentUser: () =>
    get<User>('/api/v1/auth/me'),

  // 修改密码
  changePassword: (data: { old_password: string; new_password: string }) =>
    post('/api/v1/auth/change-password', data),

  // 登出
  logout: () =>
    post('/api/v1/auth/logout')
};

// FAQ相关接口
export const faq = {
  // 获取FAQ列表
  getList: (params: {
    page?: number;
    page_size?: number;
    category_id?: number;
    keyword?: string;
    status?: string;
  }) =>
    get<{ total: number; list: FAQ[] }>('/api/v1/faqs', { params }),

  // 创建FAQ
  create: (data: Partial<FAQ>) =>
    post<FAQ>('/api/v1/faqs', data),

  // 更新FAQ
  update: (id: number, data: Partial<FAQ>) =>
    put<FAQ>(`/api/v1/faqs/${id}`, data),

  // 删除FAQ
  delete: (id: number) =>
    del(`/api/v1/faqs/${id}`),

  // 获取FAQ详情
  getDetail: (id: number) =>
    get<FAQ>(`/api/v1/faqs/${id}`),

  // 批量删除FAQ
  batchDelete: (ids: number[]) =>
    post('/api/v1/faqs/batch-delete', { ids }),

  // 获取FAQ分类列表
  getCategories: () =>
    get<{ id: number; name: string }[]>('/api/v1/faq-categories')
};

// 会话相关接口
export const chat = {
  // 创建会话
  createSession: (data: Partial<Session>) =>
    post<Session>('/api/v1/chat/sessions', data),

  // 获取会话列表
  getSessionList: (params: {
    page?: number;
    page_size?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) =>
    get<{ total: number; list: Session[] }>('/api/v1/chat/sessions', { params }),

  // 获取会话详情
  getSessionDetail: (id: number) =>
    get<Session>(`/api/v1/chat/sessions/${id}`),

  // 获取会话消息列表
  getMessageList: (sessionId: number, params: {
    page?: number;
    page_size?: number;
    message_type?: string;
  }) =>
    get<{ total: number; list: Message[] }>(`/api/v1/chat/sessions/${sessionId}/messages`, { params }),

  // 发送消息
  sendMessage: (data: Partial<Message>) =>
    post<Message>('/api/v1/chat/messages', data),

  // 获取AI回复
  getAIResponse: (data: { message: string; session_id: number }) =>
    post<ChatResponse>('/api/v1/chat/ai-response', data),

  // 关闭会话
  closeSession: (id: number, data: { rating: number; feedback: string }) =>
    post(`/api/v1/chat/sessions/${id}/close`, data),

  // 转接会话
  transferSession: (id: number, data: { agent_id: number }) =>
    post(`/api/v1/chat/sessions/${id}/transfer`, data)
};

// 统计分析相关接口
export const analytics = {
  // 获取会话统计
  getSessionStats: (params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }) =>
    get<SessionStats>('/api/v1/analytics/sessions', { params }),

  // 获取用户满意度统计
  getSatisfactionStats: (params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }) =>
    get<SatisfactionStats>('/api/v1/analytics/satisfaction', { params }),

  // 获取FAQ使用统计
  getFaqStats: (params: {
    start_date?: string;
    end_date?: string;
    faq_id?: number;
  }) =>
    get<FaqStats>('/api/v1/analytics/faqs', { params }),

  // 获取客服工作量统计
  getAgentWorkloadStats: (params: {
    start_date?: string;
    end_date?: string;
    agent_id?: number;
  }) =>
    get<AgentWorkloadStats>('/api/v1/analytics/agent-workload', { params })
}; 