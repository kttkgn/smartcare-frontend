<template>
  <div v-if="error" class="error-boundary">
    <el-result
      icon="error"
      title="页面出错了"
      :sub-title="error.message"
    >
      <template #extra>
        <el-button type="primary" @click="handleReset">重试</el-button>
      </template>
    </el-result>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})

const handleReset = () => {
  error.value = null
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  text-align: center;
}
</style> 