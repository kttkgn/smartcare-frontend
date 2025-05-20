import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FAQ } from '@/types';
import { faq } from '@/api';
import { ElMessage } from 'element-plus';

export const useFaqStore = defineStore('faq', () => {
  const faqList = ref<FAQ[]>([]);
  const total = ref(0);
  const loading = ref(false);

  // 获取FAQ列表
  async function getFaqList(params: {
    page?: number;
    page_size?: number;
    category_id?: number;
    keyword?: string;
    status?: string;
  }) {
    loading.value = true;
    try {
      const res = await faq.getList(params);
      faqList.value = res.list;
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  }

  // 创建FAQ
  async function createFaq(data: Partial<FAQ>) {
    return await faq.create(data);
  }

  // 更新FAQ
  async function updateFaq(id: number, data: Partial<FAQ>) {
    return await faq.update(id, data);
  }

  // 删除FAQ
  async function deleteFaq(id: number) {
    return await faq.delete(id);
  }

  // 获取FAQ详情
  async function getFaqDetail(id: number) {
    return await faq.getDetail(id);
  }

  // 批量删除FAQ
  async function batchDeleteFaq(ids: number[]) {
    return await faq.batchDelete(ids);
  }

  return {
    faqList,
    total,
    loading,
    getFaqList,
    createFaq,
    updateFaq,
    deleteFaq,
    getFaqDetail,
    batchDeleteFaq
  };
}); 