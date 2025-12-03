# 学习进度页面调试指南

## 问题描述
学习进度页面的课程列表显示为空白状态。

## 已添加的调试代码
1. 在 `fetchProgressCourses` 函数中添加了调试输出
2. 在 `filteredCourses` 计算属性中添加了详细的调试信息

## 调试步骤

### 1. 打开浏览器开发者工具
- 按 F12 打开开发者工具
- 切换到 Console 标签页

### 2. 刷新学习进度页面
- 导航到学习进度页面
- 查看控制台输出的调试信息

### 3. 查看关键日志
寻找以下关键日志：

```
📚 获取课程列表...
📚 获取前courses.value: ...
📝 课程列表响应: ...
📚 获取后courses.value: ...
🔍 filteredCourses计算 - courses.value: ...
```

### 4. 可能的问题和解决方案

#### 问题1: courses.value 为空数组 []
**可能原因:**
- API调用成功但返回空数据
- API调用失败但fallback没有正确执行

**检查方法:**
- 查看 `📚 获取后courses.value:` 的输出
- 如果是空数组，查看API响应和错误信息

#### 问题2: courses.value 不是数组
**可能原因:**
- API返回了非数组格式数据
- 数据处理逻辑有问题

**检查方法:**
- 查看 `🔍 courses.value是否为数组:` 的输出
- 如果为false，需要检查数据格式

#### 问题3: filteredCourses 返回空数组
**可能原因:**
- 筛选条件过于严格
- 数据状态不匹配

**检查方法:**
- 查看 `🔍 filteredCourses结果:` 的输出
- 检查筛选条件（filterForm）的值

### 5. 临时修复方案
如果API持续失败，可以在浏览器控制台执行以下命令来手动设置默认数据：

```javascript
// 在浏览器控制台执行
const defaultCourses = [
  {
    id: 1,
    name: 'Vue.js前端开发',
    enterprise: '李氏企业',
    semester: '2024春季',
    credits: 1,
    status: '进行中',
    progress: 65,
    learnedHours: 26,
    totalHours: 40,
    completedAssignments: 5,
    totalAssignments: 8
  },
  {
    id: 2,
    name: 'Python数据分析',
    enterprise: '王氏企业',
    semester: '2024春季',
    credits: 1,
    status: '进行中',
    progress: 80,
    learnedHours: 32,
    totalHours: 40,
    completedAssignments: 6,
    totalAssignments: 8
  }
];

// 假设当前页面的Vue实例可以访问
// 可能需要根据实际情况调整访问方式
```

### 6. 常见网络问题
如果API调用失败，检查：
- 服务器地址是否正确: `http://192.168.1.165:8082`
- 网络连接是否正常
- 服务器是否正在运行

### 7. 选课数据不显示问题
如果学习进度页面不显示已选的课程，可能的原因和解决方案：

#### 问题原因
1. **学习进度API返回空数据**：`/api/progress/courses` 可能没有正确实现
2. **服务器端数据不同步**：选课API和学习进度API可能使用不同的数据源
3. **用户状态问题**：用户登录状态或选课记录可能有问题

#### 新增的备用方案
代码已经添加了备用逻辑：
1. 首先尝试获取学习进度数据
2. 如果失败或为空，尝试从选课API获取已选课程
3. 如果都没有数据，显示默认课程

#### 测试数据流
可以使用浏览器控制台执行以下测试：

```javascript
// 测试选课数据流（在浏览器控制台执行）
import('./src/utils/testCourseFlow.js').then(module => {
  module.testCourseFlow()
})
```

#### 服务器端检查清单
- [ ] `/api/progress/courses` 是否返回用户的已选课程？
- [ ] 选课API (`/courses/{id}/select`) 是否正确保存选课记录？
- [ ] 用户身份验证是否正常工作？
- [ ] 数据库中的选课记录是否正确关联到用户？

## 代码修改说明
1. 添加了 `getDefaultCoursesData()` 函数提供默认数据
2. 改进了错误处理，确保API失败时使用fallback数据
3. 修复了非标准格式响应的处理逻辑
4. 添加了详细的调试日志
5. **新增**: 添加了从选课API获取数据的备用方案
6. **新增**: 创建了完整的数据流测试工具

## 后续优化
调试完成后，建议移除或注释掉调试日志，以减少控制台输出。