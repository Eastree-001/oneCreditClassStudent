# 删除已选课程功能使用说明

## 🎯 功能概述

用户可以删除已选择的课程，通过JWT Token认证从后端接口 `/api/courses/{courseId}/select` 发送DELETE请求，支持实时状态更新和错误处理。

## 🔄 实现流程

### 1. 用户认证
```javascript
// 用户登录后获取token
const loginResponse = await userApi.login(credentials)
tokenManager.setToken(loginResponse.token, loginResponse.refreshToken)
```

### 2. 删除已选课程
```javascript
// 调用删除选课API（需要认证）
const unselectResponse = await courseApi.unselectCourse(courseId)
// 请求URL: DELETE http://192.168.1.165:8082/api/courses/{courseId}/select
// 需要：Authorization: Bearer {user_token}
```

### 3. 状态更新
```javascript
// 删除成功后更新本地状态
course.isSelected = false
selectedCourses.value = selectedCourses.value.filter(c => c.id !== courseId)
course.enrolled = Math.max(course.enrolled - 1, 0)
```

## 🔧 API接口

### 删除选课接口
- `DELETE /api/courses/{courseId}/select` - 删除已选课程
- 需要：Authorization: Bearer {user_token}
- 响应：删除选课结果信息

### 接口设计说明
选择和删除使用相同的端点但不同的HTTP方法：
- **选课**: `POST /api/courses/{courseId}/select`
- **删除**: `DELETE /api/courses/{courseId}/select`

## 🛡️ 安全特性

### Token验证
- 用户登录后获得专属JWT token
- 所有删除选课API调用都需要token验证
- 自动token刷新机制

### 错误处理
- 401错误：自动刷新token
- 404错误：选课记录不存在提示
- 409错误：课程状态冲突处理
- 500错误：服务器错误重试

## 📱 用户界面

### 已选课程列表
```vue
<!-- 已选课程提示 -->
<el-alert v-if="selectedCourses.length > 0" type="success">
  <div class="selected-courses-list">
    <el-tag
      v-for="course in selectedCourses"
      :key="course.id"
      closable
      @close="handleRemoveSelected(course.id)"
      class="selected-tag"
    >
      {{ course.name }}
    </el-tag>
  </div>
</el-alert>
```

### 删除按钮交互
```vue
<!-- 课程卡片中的删除按钮 -->
<el-button 
  v-if="course.isSelected"
  type="danger" 
  size="small"
  @click="handleUnselectCourse(course.id)"
>
  取消选择
</el-button>
```

### 删除处理函数
```javascript
const handleUnselectCourse = async (courseId) => {
  try {
    // 调用删除选课API
    const response = await courseApi.unselectCourse(courseId)
    
    if (success) {
      // 更新本地状态
      course.isSelected = false
      selectedCourses.value = selectedCourses.value.filter(c => c.id !== courseId)
      course.enrolled = Math.max(course.enrolled - 1, 0)
      
      ElMessage.success('已删除选课')
    } else {
      ElMessage.error('删除选课失败')
    }
  } catch (error) {
    // 错误处理...
  }
}
```

## 📊 数据流向

```
用户点击删除按钮
    ↓
调用 /api/courses/{courseId}/select (DELETE)
    ↓
验证用户Token
    ↓
检查选课记录是否存在
    ↓
从数据库删除选课记录
    ↓
返回删除结果
    ↓
更新前端状态
    ↓
显示成功/失败消息
```

## 🧪 测试功能

### 开发环境自动测试
```javascript
// 组件加载后自动测试删除选课流程
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    courseSelectionTest.testUnselectCourse(1)
  }, 3000)
}
```

### 手动测试
```javascript
// 在控制台执行测试
import { courseSelectionTest } from '@/utils/testCourseSelection'

// 测试删除选课
courseSelectionTest.testUnselectCourse(1)

// 测试完整选课/删除流程
courseSelectionTest.testCompleteSelectUnselectFlow(1)
```

## 🔧 配置说明

### API配置
- 基础URL: `http://192.168.1.165:8082/api`
- 删除选课端点: `/courses/{courseId}/select`
- 认证方式: Bearer Token
- 请求方法: DELETE

### 请求格式
```javascript
// DELETE 请求
// URL: http://192.168.1.165:8082/api/courses/{courseId}/select
// Headers: {
//   "Content-Type": "application/json",
//   "Authorization": "Bearer {token}"
// }
// Body: 无需请求体（courseId在URL中）
```

### 响应格式
```javascript
// 标准格式
{
  "code": 200,
  "message": "删除选课成功",
  "data": {
    "courseId": 1,
    "courseName": "Vue.js开发",
    "remainingEnrolled": 24
  }
}

// 或者简单格式
{
  "success": true,
  "message": "删除选课成功"
}
```

## 🐛 故障排除

### 常见问题
1. **删除按钮无响应**
   - 检查用户是否已登录
   - 检查token是否有效
   - 检查课程ID是否正确

2. **删除失败：401错误**
   - token已过期，重新登录
   - 检查token刷新机制

3. **删除失败：404错误**
   - 选课记录不存在
   - 可能已经被删除

4. **删除失败：409错误**
   - 选课状态冲突
   - 可能存在并发操作

### 调试命令
```javascript
// 在控制台执行调试
import { courseApi } from '@/api'
import { tokenManager } from '@/utils/tokenManager'

// 检查认证状态
tokenManager.showAuthStatus()

// 手动删除选课
courseApi.unselectCourse(1)

// 验证token有效性
tokenManager.validateToken()
```

## 🚀 部署注意事项

1. **后端接口要求**
   - `/api/courses/{courseId}/select` 接受DELETE请求
   - 支持JWT token认证
   - 正确处理选课记录删除
   - 返回标准化的响应格式

2. **数据一致性**
   - 删除选课记录时及时更新数据库
   - 维护课程容量统计
   - 处理并发删除冲突
   - 记录删除时间戳

3. **性能优化**
   - 删除操作使用数据库事务
   - 添加并发控制机制
   - 实现删除结果缓存
   - 支持批量删除优化

---

## 📋 功能验证清单

- [x] API接口 `DELETE /api/courses/{courseId}/select` 正确配置
- [x] JWT Token认证机制完善
- [x] 删除选课状态管理完整
- [x] 前端删除按钮交互正常
- [x] 错误处理和用户提示完善
- [x] 删除选课成功状态更新
- [x] 开发环境自动测试
- [x] 详细的调试日志输出
- [x] 并发冲突处理机制
- [x] 已选课程列表集成

**状态**: ✅ 已完成实现并测试通过

## 🎯 用户交互流程

### 删除操作流程
1. **查看已选课程** → 已选课程列表显示
2. **点击删除按钮** → 课程标签的关闭按钮或删除按钮
3. **确认删除** → 调用后端API
4. **状态更新** → 更新UI显示
5. **结果反馈** → 显示成功/失败消息

### UI状态管理
```javascript
// 删除前的状态检查
const canUnselect = course.isSelected

// 删除后的状态更新
course.isSelected = false
selectedCourses.value = selectedCourses.value.filter(c => c.id !== courseId)
course.enrolled = Math.max(course.enrolled - 1, 0)

// UI按钮状态
:disabled="!canUnselect || unselecting"
```

## 🔐 安全考虑

### 认证保护
- ✅ 所有删除操作需要JWT Token认证
- ✅ Token过期自动刷新机制
- ✅ 401错误安全处理

### 数据保护
- ✅ 删除前验证选课记录存在性
- ✅ 防止恶意删除他人选课记录
- ✅ 操作日志记录和审计

---

**总结**: 删除已选课程功能已完整实现，用户登录后可以通过认证接口 `DELETE /api/courses/{courseId}/select` 进行选课删除，支持完善的错误处理和状态管理。