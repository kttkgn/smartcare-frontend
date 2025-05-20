import Mock from 'mockjs';
import { generateUser } from '../setup';

// 定义Mock请求选项类型
interface MockRequestOptions {
  url: string;
  type: string;
  body?: string;
}

// 模拟用户数据
const users = Array(5).fill(0).map(() => generateUser());

// 模拟token
const tokens = {
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token',
  token_type: 'Bearer',
  expires_in: 7200
};

export function authMock() {
  // 登录
  Mock.mock(/\/api\/v1\/auth\/login/, 'post', (options: MockRequestOptions) => {
    const { username, password } = JSON.parse(options.body || '{}');
    
    if (username === 'admin' && password === 'admin123') {
      return {
        code: 200,
        message: '登录成功',
        data: tokens
      };
    }
    
    return {
      code: 401,
      message: '用户名或密码错误'
    };
  });

  // 刷新token
  Mock.mock(/\/api\/v1\/auth\/refresh/, 'post', (options: MockRequestOptions) => {
    const { refresh_token } = JSON.parse(options.body || '{}');
    
    if (refresh_token === tokens.refresh_token) {
      return {
        code: 200,
        message: '刷新成功',
        data: {
          ...tokens,
          access_token: 'new_mock_access_token'
        }
      };
    }
    
    return {
      code: 401,
      message: '无效的刷新token'
    };
  });

  // 获取当前用户信息
  Mock.mock(/\/api\/v1\/auth\/me/, 'get', () => {
    return {
      code: 200,
      message: '获取成功',
      data: users[0]
    };
  });

  // 修改密码
  Mock.mock(/\/api\/v1\/auth\/change-password/, 'post', (options: MockRequestOptions) => {
    const { old_password, new_password } = JSON.parse(options.body || '{}');
    
    if (old_password === 'admin123') {
      return {
        code: 200,
        message: '修改成功'
      };
    }
    
    return {
      code: 400,
      message: '原密码错误'
    };
  });

  // 登出
  Mock.mock(/\/api\/v1\/auth\/logout/, 'post', () => {
    return {
      code: 200,
      message: '登出成功'
    };
  });
}
 