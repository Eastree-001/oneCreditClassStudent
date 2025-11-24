# EduNexus 学分课堂学生端

一个现代化的学分课堂学生端管理系统，使用 Vue 3 + Element Plus 构建。

## 功能特性

- 🎓 **学习进度查询** - 查看课程学习进度、学分获取情况
- 📚 **课程选择** - 浏览和选择课程，支持筛选和搜索
- 💼 **项目实训** - 选择企业真实项目进行实训
- 📊 **数据统计** - 可视化展示学习数据和进度
- 🎨 **现代化UI** - 美观的界面设计，优秀的用户体验

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Element Plus - 基于 Vue 3 的组件库
- Vue Router - 官方路由管理器
- Pinia - 状态管理
- Vite - 下一代前端构建工具
- Sass - CSS 预处理器

## 项目结构

```
EduNexus学生端/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 公共组件
│   ├── layouts/         # 布局组件
│   ├── router/          # 路由配置
│   ├── styles/          # 全局样式
│   ├── views/           # 页面组件
│   │   ├── Home.vue              # 首页
│   │   ├── Progress.vue          # 学习进度
│   │   ├── CourseSelection.vue   # 选课
│   │   └── ProjectTraining.vue   # 项目实训
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── README.md            # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 页面说明

### 首页
- 欢迎横幅和统计信息
- 快速操作入口
- 最近学习的课程
- 通知公告

### 学习进度
- 课程学习进度统计
- 课程列表和筛选
- 进度可视化
- 学分获取趋势

### 选课
- 课程浏览和筛选
- 课程详情查看
- 选课管理
- 已选课程提示

### 项目实训
- 项目列表浏览
- 项目筛选和搜索
- 项目详情查看
- 项目报名功能

## 开发说明

本项目目前仅包含前端页面部分，数据为模拟数据。后续可以：

1. 集成后端 API
2. 添加状态管理（Pinia）
3. 集成图表库（如 ECharts）
4. 添加更多功能模块
5. 优化移动端适配

## 许可证

MIT License
