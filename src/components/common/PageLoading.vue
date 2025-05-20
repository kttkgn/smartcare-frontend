<template>
  <div class="page-loading" v-if="loading">
    <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
    <span class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

defineProps<{
  loading: boolean
  text?: string
}>()
</script>

<style scoped>
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: #409EFF;
  font-size: 14px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 