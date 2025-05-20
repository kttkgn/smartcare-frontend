<template>
  <div class="layout">
    <Sidebar :collapse="isCollapse" />
    <div class="main">
      <Header v-model:collapse="isCollapse" />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';

const isCollapse = ref(false);
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style> 