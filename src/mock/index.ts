import Mock from 'mockjs';
import { setupMock } from './setup';
import { authMock } from './modules/auth';
import { faqMock } from './modules/faq';
import { chatMock } from './modules/chat';
import { analyticsMock } from './modules/analytics';

// 设置mock延迟
Mock.setup({
  timeout: '300-600'
});

// 注册所有mock
function setupAllMocks() {
  setupMock();
  authMock();
  faqMock();
  chatMock();
  analyticsMock();
}

export default setupAllMocks; 