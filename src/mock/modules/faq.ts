import Mock from 'mockjs';
import { generateFAQ, generatePagination } from '../setup';

// 定义Mock请求选项类型
interface MockRequestOptions {
  url: string;
  type: string;
  body?: string;
}

// 模拟FAQ数据
const faqs = Array(50).fill(0).map(() => generateFAQ());

// 模拟FAQ分类
const categories = Array(10).fill(0).map((_, index) => ({
  id: index + 1,
  name: Mock.Random.ctitle(4, 8)
}));

export function faqMock() {
  // 获取FAQ列表
  Mock.mock(/\/api\/v1\/faqs(\?.*)?$/, 'get', (options: MockRequestOptions) => {
    const url = new URL(options.url, 'http://localhost');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '10');
    const categoryId = url.searchParams.get('category_id');
    const keyword = url.searchParams.get('keyword');
    const status = url.searchParams.get('status');

    let filteredFaqs = [...faqs];

    // 按分类筛选
    if (categoryId) {
      filteredFaqs = filteredFaqs.filter(faq => faq.category_id === parseInt(categoryId));
    }

    // 按关键词搜索
    if (keyword) {
      filteredFaqs = filteredFaqs.filter(faq => 
        faq.question.includes(keyword) || faq.answer.includes(keyword)
      );
    }

    // 按状态筛选
    if (status) {
      filteredFaqs = filteredFaqs.filter(faq => faq.status === status);
    }

    return {
      code: 200,
      message: '获取成功',
      data: generatePagination(filteredFaqs, page, pageSize)
    };
  });

  // 创建FAQ
  Mock.mock(/\/api\/v1\/faqs/, 'post', (options: MockRequestOptions) => {
    const data = JSON.parse(options.body || '{}');
    const newFaq = {
      ...generateFAQ(),
      ...data,
      id: faqs.length + 1
    };
    faqs.unshift(newFaq);
    
    return {
      code: 200,
      message: '创建成功',
      data: newFaq
    };
  });

  // 更新FAQ
  Mock.mock(/\/api\/v1\/faqs\/\d+/, 'put', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/faqs\/(\d+)/)?.[1] || '0');
    const data = JSON.parse(options.body || '{}');
    const index = faqs.findIndex(faq => faq.id === id);
    
    if (index > -1) {
      faqs[index] = {
        ...faqs[index],
        ...data,
        updated_at: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      };
      
      return {
        code: 200,
        message: '更新成功',
        data: faqs[index]
      };
    }
    
    return {
      code: 404,
      message: 'FAQ不存在'
    };
  });

  // 删除FAQ
  Mock.mock(/\/api\/v1\/faqs\/\d+/, 'delete', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/faqs\/(\d+)/)?.[1] || '0');
    const index = faqs.findIndex(faq => faq.id === id);
    
    if (index > -1) {
      faqs.splice(index, 1);
      return {
        code: 200,
        message: '删除成功'
      };
    }
    
    return {
      code: 404,
      message: 'FAQ不存在'
    };
  });

  // 获取FAQ详情
  Mock.mock(/\/api\/v1\/faqs\/\d+/, 'get', (options: MockRequestOptions) => {
    const id = parseInt(options.url.match(/\/api\/v1\/faqs\/(\d+)/)?.[1] || '0');
    const faq = faqs.find(f => f.id === id);
    
    if (faq) {
      return {
        code: 200,
        message: '获取成功',
        data: faq
      };
    }
    
    return {
      code: 404,
      message: 'FAQ不存在'
    };
  });

  // 批量删除FAQ
  Mock.mock(/\/api\/v1\/faqs\/batch-delete/, 'post', (options: MockRequestOptions) => {
    const { ids } = JSON.parse(options.body || '{}');
    
    ids.forEach((id: number) => {
      const index = faqs.findIndex(faq => faq.id === id);
      if (index > -1) {
        faqs.splice(index, 1);
      }
    });
    
    return {
      code: 200,
      message: '删除成功'
    };
  });

  // 获取FAQ分类列表
  Mock.mock(/\/api\/v1\/faq-categories/, 'get', () => {
    return {
      code: 200,
      message: '获取成功',
      data: categories
    };
  });
} 