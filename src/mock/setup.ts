import Mock from 'mockjs';

// 生成分页数据
export function generatePagination<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = list.slice(start, end);
  
  return {
    items,
    total: list.length,
    page,
    page_size: pageSize
  };
}

// 生成随机ID
export function generateId() {
  return Mock.Random.integer(1, 10000);
}

// 生成随机时间
export function generateTime() {
  return Mock.Random.datetime('yyyy-MM-dd HH:mm:ss');
}

// 生成随机用户数据
export function generateUser() {
  return {
    id: generateId(),
    username: Mock.Random.cname(),
    email: Mock.Random.email(),
    avatar: Mock.Random.image('100x100', Mock.Random.color(), '#FFF', 'png', Mock.Random.first()),
    role: Mock.Random.pick(['admin', 'agent']),
    status: Mock.Random.pick(['active', 'inactive']),
    created_at: generateTime(),
    updated_at: generateTime()
  };
}

// 生成随机FAQ数据
export function generateFAQ() {
  return {
    id: generateId(),
    question: Mock.Random.ctitle(10, 20),
    answer: Mock.Random.cparagraph(2, 4),
    category_id: generateId(),
    category_name: Mock.Random.ctitle(4, 8),
    tags: Array(Mock.Random.integer(1, 5)).fill(0).map(() => Mock.Random.word(4, 8)),
    status: Mock.Random.pick(['active', 'inactive']),
    created_at: generateTime(),
    updated_at: generateTime(),
    created_by: generateId(),
    updated_by: generateId()
  };
}

// 生成随机会话数据
export function generateSession() {
  return {
    id: generateId(),
    user_id: generateId(),
    user_name: Mock.Random.cname(),
    agent_id: generateId(),
    agent_name: Mock.Random.cname(),
    status: Mock.Random.pick(['active', 'closed', 'transferred']),
    source: Mock.Random.pick(['web', 'mobile', 'wechat']),
    created_at: generateTime(),
    updated_at: generateTime(),
    last_message_at: generateTime(),
    rating: Mock.Random.integer(1, 5),
    feedback: Mock.Random.cparagraph(1, 2)
  };
}

// 生成随机消息数据
export function generateMessage() {
  return {
    id: generateId(),
    session_id: generateId(),
    sender_type: Mock.Random.pick(['user', 'agent', 'bot']),
    sender_id: generateId(),
    sender_name: Mock.Random.cname(),
    content: Mock.Random.cparagraph(1, 3),
    message_type: Mock.Random.pick(['text', 'image', 'file']),
    file_url: Mock.Random.image('200x200'),
    created_at: generateTime(),
    is_read: Mock.Random.boolean()
  };
}

// 设置mock拦截器
export function setupMock() {
  // 拦截所有请求
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
  Mock.XHR.prototype.send = function() {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false;
      
      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType;
      }
    }
    this.proxy_send.apply(this, arguments);
  };
} 