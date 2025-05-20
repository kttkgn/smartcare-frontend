import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/components/layout/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: {
            title: '仪表盘',
            icon: 'Odometer'
          }
        },
        {
          path: 'faq',
          name: 'FAQ',
          component: () => import('@/views/faq/index.vue'),
          meta: {
            title: 'FAQ管理',
            icon: 'QuestionFilled'
          }
        },
        {
          path: 'chat',
          name: 'Chat',
          component: () => import('@/views/chat/index.vue'),
          meta: {
            title: '会话管理',
            icon: 'ChatDotRound'
          }
        },
        {
          path: 'analytics',
          name: 'Analytics',
          component: () => import('@/views/analytics/index.vue'),
          meta: {
            title: '统计分析',
            icon: 'TrendCharts'
          }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/settings/index.vue'),
          meta: {
            title: '系统设置',
            icon: 'Setting'
          }
        }
      ],
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 智能客服系统` : '智能客服系统';

  if (requiresAuth && !authStore.token) {
    next('/login');
  } else if (to.path === '/login' && authStore.token) {
    next('/');
  } else {
    next();
  }
});

export default router; 