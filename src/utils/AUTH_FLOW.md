# 用户认证与推荐课程API验证流程

## 📋 流程概述

1. **用户登录** → 获取专属token
2. **Token管理** → 统一管理token和refreshToken  
3. **API验证** → 使用token验证推荐课程接口
4. **错误处理** → 自动刷新token或重新登录

## 🔐 认证流程详解

### 1. 用户登录 (`Login.vue`)
```javascript
// 发送登录请求
const response = await userApi.login({ username, password })

// 保存token到tokenManager
tokenManager.setToken(data.token, data.refreshToken)

// 验证推荐课程API可用性
const testResponse = await userApi.getRecommendedCourses()
```

### 2. Token管理 (`tokenManager.js`)
```javascript
// 核心功能
- validateToken()      // 验证token有效性
- refreshToken()      // 刷新过期token
- setToken()          // 保存token
- clearTokens()       // 清除tokens
- isAuthenticated()   // 检查认证状态
```

### 3. 推荐课程API调用 (`CourseSelection.vue`)
```javascript
// 检查认证状态
const { tokenManager } = await import('@/utils/tokenManager')
const isAuth = tokenManager.isAuthenticated()

// 获取推荐课程
const response = await courseApi.getRecommendedCourses()
```

### 4. 请求拦截器 (`request.js`)
```javascript
// 自动添加Authorization头
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}

// 401错误自动刷新token
if (error.response?.status === 401) {
  const newToken = await tokenManager.refreshToken()
}
```

## 🛡️ 安全特性

### Token验证
- 登录后立即验证推荐课程API可用性
- 每次调用推荐课程API前检查token状态
- 自动处理token过期情况

### 错误处理
- 401错误：尝试刷新token
- 403错误：权限不足
- 500错误：服务器问题
- 网络错误：提示检查连接

### 开发测试
- 开发环境自动运行认证流程测试
- 提供测试工具验证各个环节
- 详细的日志输出便于调试

## 📡 API端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh-token` - 刷新token
- `GET /api/auth/me` - 验证当前token

### 推荐课程
- `GET /api/courses/recommended` - **需要认证**
- 使用用户专属token从后端数据库获取个性化推荐

## 🔧 使用示例

### 基本使用
```javascript
// 用户登录后
const { tokenManager } = await import('@/utils/tokenManager')

// 检查认证状态
if (tokenManager.isAuthenticated()) {
  // 获取推荐课程
  const courses = await courseApi.getRecommendedCourses()
}
```

### 手动测试
```javascript
import { authTest } from '@/utils/testAuth'

// 测试完整认证流程
const result = await authTest.testAuthFlow(credentials)

// 测试推荐课程API认证
const authTest = await authTest.testRecommendedCoursesAuth()
```

## 🚀 部署注意事项

1. **环境变量**：确保API_BASE_URL正确配置
2. **HTTPS**：生产环境必须使用HTTPS保护token
3. **CORS**：后端配置正确的CORS策略
4. **Token过期**：设置合理的token有效期
5. **日志**：生产环境关闭详细错误日志

## 🐛 常见问题

### Q: 推荐课程API返回401错误
A: 检查用户是否已登录，token是否过期

### Q: Token刷新失败
A: 检查refreshToken是否有效，可能需要重新登录

### Q: 推荐课程为空
A: 确认后端数据库中该用户有推荐数据

### Q: 开发环境token问题
A: 使用测试工具验证认证流程：`authTest.testAuthFlow()`

### Q: 推荐课程详情获取失败
A: 
1. 检查用户是否已登录
2. 验证token有效性
3. 使用开发测试工具：`recommendedCoursesTest.testRecommendedCoursesFlow()`
4. 查看浏览器控制台日志

### Q: 如何测试推荐课程功能
A: 在浏览器控制台执行：
```javascript
import { recommendedCoursesTest } from '@/utils/testRecommendedCourses'
// 测试完整流程
recommendedCoursesTest.testRecommendedCoursesFlow()
// 测试单个课程详情
recommendedCoursesTest.testCourseDetail(1)
```