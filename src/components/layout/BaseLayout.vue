<template>
  <div class="base-layout">
    <el-container>
      <el-aside width="200px">
        <slot name="sidebar"></slot>
      </el-aside>
      <el-container>
        <el-header height="60px">
          <slot name="header"></slot>
        </el-header>
        <el-main>
          <slot></slot>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 基础布局组件
</script>

<style scoped>
.base-layout {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style> 