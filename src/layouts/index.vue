<template>
  <BaseLayout>
    <template #sidebar>
      <Sidebar :is-collapse="isCollapse" />
    </template>
    <template #header>
      <Header @toggle-sidebar="handleToggleSidebar" />
    </template>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const isCollapse = ref(false)

const handleToggleSidebar = (value: boolean) => {
  isCollapse.value = value
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 