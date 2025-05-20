import request from '@/utils/request';
import type { Session, Message } from '@/types';

export const chatApi = {
  createSession: (data: { user_id: number }) => {
    return request.post<Session>('/api/v1/chat/sessions', data);
  },

  getSessions: () => {
    return request.get<Session[]>('/api/v1/chat/sessions');
  },

  getMessages: (sessionId: number, params?: { skip?: number; limit?: number }) => {
    return request.get<Message[]>(`/api/v1/chat/sessions/${sessionId}/messages`, { params });
  },

  sendMessage: (data: { session_id: number; content: string; sender_type: string; sender_id: number }) => {
    return request.post<Message>('/api/v1/chat/messages', data);
  },

  endSession: (sessionId: number) => {
    return request.post(`/api/v1/chat/sessions/${sessionId}/end`);
  },
}; 