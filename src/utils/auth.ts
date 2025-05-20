// Token相关操作
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// 获取token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// 设置token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// 移除token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
} 