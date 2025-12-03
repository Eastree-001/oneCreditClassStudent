# 课程选课功能使用说明

## 🎯 功能概述

用户登录后，可以通过JWT Token认证从后端接口 `/api/courses/{courseId}/select` 进行单个课程的选择，支持实时状态更新和错误处理。

## 🔄 实现流程

### 1. 用户认证
```javascript
// 用户登录后获取token
const loginResponse = await userApi.login(credentials)
tokenManager.setToken(loginResponse.token, loginResponse.refreshToken)
```

### 2. 课程选择
```javascript
// 调用选课API（需要认证）
const selectResponse = await courseApi.selectCourse(courseId)
// 请求URL: POST http://192.168.1.165:8082/api/courses/{courseId}/select
// 需要：Authorization: Bearer {user_token}
```

### 3. 状态更新
```javascript
// 选课成功后更新本地状态
course.isSelected = true
selectedCourses.value.push(course)
course.enrolled = Math.min(course.enrolled + 1, course.capacity)
```

## 🔧 API接口

### 新增接口
- `POST /api/courses/{courseId}/select` - 选择单个课程
- 需要：Authorization: Bearer {user_token}
- 响应：选课结果信息

### 保留接口
- `POST /api/courses/confirm-selection` - 批量确认选课（作为备用）

## 🛡️ 安全特性

### Token验证
- 用户登录后获得专属JWT token
- 所有选课API调用都需要token验证
- 自动token刷新机制

### 错误处理
- 401错误：自动刷新token
- 400错误：请求参数错误提示
- 409错误：课程冲突处理
- 500错误：服务器错误重试

## 📱 用户界面

### 选课按钮
```vue
<el-button 
  type="primary" 
  size="small"
  @click="handleSelectCourse(course)"
  :disabled="course.isSelected || course.enrolled >= course.capacity"
>
  选择课程
</el-button>
```

### 状态检查
```javascript
const handleSelectCourse = async (course) => {
  // 1. 检查是否已选择
  if (selectedCourses.value.find(c => c.id === course.id)) {
    ElMessage.warning('该课程已选择')
    return
  }

  // 2. 检查是否已满员
  if (course.enrolled >= course.capacity) {
    ElMessage.error('该课程已满员，无法选择')
    return
  }

  // 3. 检查是否已选修
  if (course.alreadySelected) {
    ElMessage.warning('您已经选修过这门课程')
    return
  }

  // 4. 调用选课API
  const response = await courseApi.selectCourse(course.id)
  // ...处理响应
}
```

## 📊 数据流向

```
用户点击选课按钮
    ↓
检查课程可选状态
    ↓
调用 /api/courses/{courseId}/select
    ↓
验证用户Token
    ↓
检查课程容量和状态
    ↓
更新数据库选课记录
    ↓
返回选课结果
    ↓
更新前端状态
    ↓
显示成功/失败消息
```

## 🧪 测试功能

### 开发环境自动测试
```javascript
// 组件加载后自动测试选课流程
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    courseSelectionTest.testSelectCourseFlow(1)
  }, 2000)
}
```

### 手动测试
```javascript
// 在控制台执行测试
import { courseSelectionTest } from '@/utils/testCourseSelection'

// 测试单个课程选课
courseSelectionTest.testSelectCourseFlow(1)

// 测试选课认证需求
courseSelectionTest.testSelectCourseAuth(1)

// 测试多个课程选课
courseSelectionTest.testMultipleCourseSelection([1, 2, 3])

// 测试选课冲突处理
courseSelectionTest.testCourseSelectionConflict(1)
```

## 🔧 配置说明

### API配置
- 基础URL: `http://192.168.1.165:8082/api`
- 选课端点: `/courses/{courseId}/select`
- 认证方式: Bearer Token
- 请求方法: POST

### 请求格式
```javascript
// POST 请求
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
  "message": "选课成功",
  "data": {
    "courseId": 1,
    "courseName": "Vue.js开发",
    "enrolled": 25,
    "capacity": 30
  }
}

// 或者简单格式
{
  "success": true,
  "message": "选课成功"
}
```

## 🐛 故障排除

### 常见问题
1. **选课按钮无响应**
   - 检查用户是否已登录
   - 检查token是否有效
   - 检查课程ID是否正确

2. **选课失败：401错误**
   - token已过期，重新登录
   - 检查token刷新机制

3. **选课失败：400错误**
   - 课程不存在或无效
   - 请求参数错误

4. **选课失败：409错误**
   - 已选过该课程
   - 课程时间冲突
   - 课程已满员

### 调试命令
```javascript
// 在控制台执行调试
import { courseApi } from '@/api'
import { tokenManager } from '@/utils/tokenManager'

// 检查认证状态
tokenManager.showAuthStatus()

// 手动选课
courseApi.selectCourse(1)

// 验证token有效性
tokenManager.validateToken()
```

## 🚀 部署注意事项

1. **后端接口要求**
   - `/api/courses/{courseId}/select` 接受POST请求
   - 支持JWT token认证
   - 正确处理课程容量检查
   - 返回标准化的响应格式

2. **数据一致性**
   - 选课成功后及时更新数据库
   - 处理并发选课冲突
   - 维护课程容量统计
   - 记录选课时间戳

3. **性能优化**
   - 选课操作使用数据库事务
   - 添加并发控制机制
   - 实现选课结果缓存
   - 支持批量选课优化

---

## 📋 功能验证清单

- [x] API接口 `/api/courses/{courseId}/select` 正确配置
- [x] JWT Token认证机制完善
- [x] 课程状态检查逻辑完整
- [x] 前端选课按钮交互正常
- [x] 错误处理和用户提示完善
- [x] 选课成功状态更新
- [x] 开发环境自动测试
- [x] 详细的调试日志输出
- [x] 冲突处理机制

**状态**: ✅ 已完成实现并测试通过

## 🎯 交互流程

### 用户操作流程
1. **浏览课程** → 查看可选课程列表
2. **点击选课** → 检查课程状态
3. **确认选课** → 调用后端API
4. **状态更新** → 更新UI显示
5. **结果反馈** → 显示成功/失败消息

### 前端状态管理
```javascript
// 选课前的状态检查
const canSelect = !course.isSelected && 
                !course.alreadySelected && 
                course.enrolled < course.capacity

// 选课后的状态更新
course.isSelected = true
course.enrolled += 1
selectedCourses.value.push(course)

// UI按钮状态
:disabled="!canSelect || selecting"
```

**总结**: 单个课程选课功能已完整实现，用户登录后可以通过认证接口 `/api/courses/{courseId}/select` 进行课程选择，支持完善的错误处理和状态管理。