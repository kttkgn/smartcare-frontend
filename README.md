# SmartCare 智能客服系统

SmartCare 是一个现代化的智能客服系统，旨在提供高效、智能的客户服务解决方案。系统集成了智能问答、会话管理、数据分析等功能，帮助客服团队提升工作效率和客户满意度。

## 功能特性

### 1. 智能问答管理
- FAQ 知识库管理
- 智能问答匹配
- 热门问题展示
- 问题分类与标签管理

### 2. 会话管理
- 实时会话监控
- 会话转接功能
- 会话状态管理
- 历史会话查询

### 3. 数据分析
- 会话数据统计
- 客服绩效分析
- 客户满意度分析
- 响应时间分析

### 4. 系统管理
- 客服人员管理
- 权限控制
- 系统配置
- 个人中心

## 技术栈

- 前端框架：Vue 3
- UI 组件库：Element Plus
- 状态管理：Pinia
- 路由管理：Vue Router
- HTTP 客户端：Axios
- 构建工具：Vite
- 开发语言：TypeScript

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/smart-cs-system.git
cd smart-cs-system/frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── api/          # API 接口定义
├── assets/       # 静态资源
├── components/   # 公共组件
├── layouts/      # 布局组件
├── router/       # 路由配置
├── stores/       # 状态管理
├── styles/       # 全局样式
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数
└── views/        # 页面组件
```

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 风格指南

### 提交规范
提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

type 类型：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 部署说明

1. 构建项目
```bash
npm run build
```

2. 部署 dist 目录到 Web 服务器

3. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-api;
    }
}
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
