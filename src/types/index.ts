// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'agent';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// 客服类型
export interface Agent {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// 会话相关类型
export interface Session {
  id: number;
  user_id: number;
  user_name?: string;
  agent_id?: number;
  agent_name?: string;
  status: 'active' | 'closed' | 'transferred';
  source: 'web' | 'mobile' | 'wechat';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  rating?: number;
  feedback?: string;
}

// 消息相关类型
export interface Message {
  id: number;
  session_id: number;
  sender_type: 'user' | 'agent' | 'bot';
  sender_id: number;
  sender_name?: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  is_read: boolean;
}

// FAQ相关类型
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category_id: number;
  category_name?: string;
  tags: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

// 标签类型
export interface Tag {
  id: number;
  name: string;
}

// 认证相关类型
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// 统计分析类型
export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  closed_sessions: number;
  avg_duration: number;
  avg_response_time: number;
  by_date: {
    date: string;
    count: number;
  }[];
}

export interface SatisfactionStats {
  total_ratings: number;
  avg_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
  }[];
  by_date: {
    date: string;
    avg_rating: number;
  }[];
}

export interface FaqStats {
  total_views: number;
  total_helpful: number;
  helpful_rate: number;
  by_faq: {
    faq_id: number;
    question: string;
    views: number;
    helpful: number;
  }[];
}

export interface AgentWorkloadStats {
  total_sessions: number;
  avg_response_time: number;
  avg_rating: number;
  by_agent: {
    agent_id: number;
    agent_name: string;
    sessions: number;
    avg_response_time: number;
    avg_rating: number;
  }[];
}

// AI响应类型
export interface ChatResponse {
  message: string;
  suggested_questions?: string[];
  related_faqs?: FAQ[];
  confidence: number;
}

// 统计数据类型
export interface Statistics {
  total_sessions: number;
  bot_response_rate: number;
  human_transfer_rate: number;
  average_response_time: number;
}

// 趋势数据类型
export interface TrendData {
  date: string;
  value: number;
}

// 聊天会话状态
export interface ChatState {
  currentSession: Session | null;
  messages: Message[];
  ws: WebSocket | null;
}

// FAQ状态
export interface FAQState {
  faqs: FAQ[];
  loading: boolean;
}

// 认证状态
export interface AuthState {
  token: string | null;
  agent: Agent | null;
} 