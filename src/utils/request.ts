import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { getToken, setToken, removeToken } from '@/utils/auth';
import { auth } from '@/api';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 尝试刷新token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          return auth.refreshToken({ refresh_token: refreshToken })
            .then((res) => {
              setToken(res.access_token);
              localStorage.setItem('refresh_token', res.refresh_token);
              // 重试原请求
              const config = response.config;
              config.headers['Authorization'] = `Bearer ${res.access_token}`;
              return service(config);
            })
            .catch(() => {
              removeToken();
              window.location.href = '/login';
            });
        } else {
          removeToken();
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  (error) => {
    message.error(error.message || '请求失败');
    return Promise.reject(error);
  }
);

// 封装GET请求
export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, config);
}

// 封装POST请求
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config);
}

// 封装PUT请求
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config);
}

// 封装DELETE请求
export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config);
}

// 开发环境下启用mock
if (import.meta.env.DEV) {
  import('../mock').then(({ default: mock }) => {
    mock();
  });
}

export default service; 