<template>
  <div class="empty-state">
    <el-empty
      :image="image"
      :image-size="200"
      :description="description"
    >
      <template #default>
        <slot></slot>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image?: string
  description?: string
}>()
</script>

<style scoped>
.empty-state {
  padding: 40px;
  text-align: center;
}
</style> 