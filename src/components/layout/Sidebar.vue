<template>
  <div class="sidebar">
    <div class="logo">
      <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
      <h1>智能客服系统</h1>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataLine /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <el-menu-item index="/chat">
        <el-icon><ChatDotRound /></el-icon>
        <template #title>会话管理</template>
      </el-menu-item>

      <el-menu-item index="/faq">
        <el-icon><QuestionFilled /></el-icon>
        <template #title>FAQ管理</template>
      </el-menu-item>

      <el-menu-item index="/analytics">
        <el-icon><TrendCharts /></el-icon>
        <template #title>统计分析</template>
      </el-menu-item>

      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  DataLine,
  ChatDotRound,
  QuestionFilled,
  TrendCharts,
  Setting
} from '@element-plus/icons-vue';

const route = useRoute();
const isCollapse = ref(false);

const activeMenu = computed(() => {
  return route.path;
});
</script>

<style scoped>
.sidebar {
  height: 100%;
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3649;
  padding: 0 16px;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo h1 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}
</style> 