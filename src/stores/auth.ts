import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Agent } from '@/types';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const agent = ref<Agent | null>(null);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const setAgent = (newAgent: Agent) => {
    agent.value = newAgent;
  };

  // mock 登录，不再调用后端接口
  const login = async (email: string, password: string) => {
    // 你可以自定义用户名密码规则
    if (email && password) {
      setToken('mock-token');
      setAgent({
        id: 1,
        email,
        name: '管理员',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      ElMessage.success('登录成功');
      return true;
    } else {
      ElMessage.error('登录失败，请输入邮箱和密码');
      return false;
    }
  };

  const logout = () => {
    token.value = '';
    agent.value = null;
    localStorage.removeItem('token');
  };

  // mock 获取用户信息
  const fetchAgentInfo = async () => {
    if (token.value) {
      setAgent({
        id: 1,
        email: 'admin@mock.com',
        name: '管理员',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      logout();
    }
  };

  return {
    token,
    agent,
    login,
    logout,
    fetchAgentInfo,
  };
}); 