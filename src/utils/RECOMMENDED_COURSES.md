# 推荐课程功能实现说明

## 🎯 功能概述

用户登录后获取专属token，通过token验证后端接口 `/api/courses/{courseId}` 获取推荐课程的详细信息，并在选课界面中展示。

## 🔄 实现流程

### 1. 用户认证
```javascript
// 用户登录后获取token
const loginResponse = await userApi.login(credentials)
tokenManager.setToken(loginResponse.token, loginResponse.refreshToken)
```

### 2. 获取推荐课程
```javascript
// 调用推荐课程API（需要认证）
const recommendedCourses = await courseApi.getRecommendedCourses()
```

### 3. 获取课程详情
```javascript
// 点击推荐课程时获取完整详情
const courseDetail = await courseApi.getCourseDetail(courseId)
```

### 4. 展示课程信息
```vue
<!-- 增强的推荐课程卡片 -->
<el-card class="recommendation-card" @click="handleViewDetail(course)">
  <div class="recommendation-content">
    <div class="recommendation-badge">推荐</div>
    <h4>{{ course.name }}</h4>
    <p>{{ course.description }}</p>
    <div class="recommendation-meta">
      <div class="meta-item">
        <el-icon><User /></el-icon>
        <span>{{ course.teacher }}</span>
      </div>
      <!-- 更多元信息 -->
    </div>
    <div class="recommendation-reason">
      <el-tag>{{ course.recommendReason }}</el-tag>
    </div>
    <div class="recommendation-action">
      <el-button @click="handleViewDetail(course)">查看详情</el-button>
      <el-button @click="handleSelectCourse(course)">选择课程</el-button>
    </div>
  </div>
</el-card>
```

## 🔧 API接口

### 新增接口
- `GET /api/courses/{courseId}` - 获取单个课程详情
- 需要：Authorization: Bearer {user_token}
- 响应：完整的课程信息（从后端数据库获取）

### 现有接口
- `GET /api/courses/recommended` - 获取推荐课程列表
- 需要：Authorization: Bearer {user_token}

## 🛡️ 安全特性

### Token验证
- 用户登录后获得专属JWT token
- 所有推荐课程API调用都需要token验证
- 自动token刷新机制

### 错误处理
- 401错误：自动刷新token
- 403错误：权限不足提示
- 500错误：服务器错误重试
- 网络错误：友好提示用户

## 📱 用户界面

### 推荐课程展示
- 🔥 突出显示推荐标识
- 📋 显示完整课程信息（教师、时长、评分等）
- 🏷️ 显示推荐原因标签
- ⚡ 快速操作按钮（查看详情、选择课程）

### 交互功能
- 🖱️ 点击卡片查看详细信息
- ➕ 直接选择推荐课程
- 🔄 刷新推荐列表
- 📱 响应式设计

## 🧪 测试功能

### 开发环境自动测试
```javascript
// 组件加载后自动测试推荐课程流程
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testRecommendedCourseFlow()
  }, 2000)
}
```

### 测试内容
1. ✅ Token认证状态检查
2. ✅ 推荐课程API调用
3. ✅ 课程详情API调用
4. ✅ 数据完整性验证
5. ✅ UI展示效果

## 📊 数据流向

```
用户登录 
    ↓
获取专属token
    ↓
调用 /api/courses/recommended (带token)
    ↓
获取推荐课程列表
    ↓
用户点击推荐课程
    ↓
调用 /api/courses/{courseId} (带token)
    ↓
获取课程详情
    ↓
展示在选课界面
```

## 🎨 样式特点

### 推荐课程卡片
- 🔵 蓝色边框突出显示
- 🌟 渐变背景效果
- ⭐ 推荐徽章标识
- 🎯 悬停动画效果
- 📱 响应式网格布局

### 响应式设计
- 桌面端：多列网格布局
- 移动端：单列垂直布局
- 平板端：自适应列数

## 🔧 配置说明

### 环境变量
- `API_BASE_URL`: http://192.168.1.165:8082/api
- `NODE_ENV`: development/production

### 接口配置
- Token过期时间：根据后端配置
- 自动刷新：启用
- 错误重试：3次

## 🐛 故障排除

### 常见问题
1. **推荐课程不显示**
   - 检查用户是否已登录
   - 检查token是否有效
   - 检查后端推荐数据

2. **课程详情获取失败**
   - 检查课程ID是否正确
   - 检查API路径是否配置正确
   - 检查网络连接

3. **Token认证失败**
   - 检查token是否过期
   - 检查refreshToken是否存在
   - 重新登录获取新token

### 调试命令
```javascript
// 在控制台执行测试
authTest.testRecommendedCoursesAuth()

// 手动获取推荐课程
courseApi.getRecommendedCourses()

// 获取特定课程详情
courseApi.getCourseDetail(1)
```

## 🚀 部署注意事项

1. **后端接口要求**
   - `/api/courses/recommended` 返回个性化推荐
   - `/api/courses/{id}` 返回完整课程信息
   - 支持JWT token认证

2. **数据格式要求**
   - 统一响应格式：{code, message, data}
   - 课程详情包含必要字段：id, name, description, teacher等

3. **性能优化**
   - 推荐课程列表缓存
   - 课程详情按需加载
   - 图片懒加载优化

---

**状态**: ✅ 已完成实现并测试通过