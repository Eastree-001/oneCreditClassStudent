# 推荐课程教师数据后端获取方案

## 问题描述
推荐课程的教师字段未定义，需要从后端数据库中获取各个课程的指导教师信息。

## 解决方案

### 1. 新增API端点

```javascript
// 在 courseApi 中新增：
- getCourseTeacher(courseId)     // 获取单个课程教师
- getBatchCourseTeachers(courseIds) // 批量获取课程教师
```

**对应的REST端点：**
```
GET  /api/courses/{courseId}/teacher     // 获取单个课程教师
POST /api/courses/teachers               // 批量获取课程教师
```

### 2. 教师数据获取工具

创建了 `teacherDataBackend.js` 工具，包含以下功能：

#### 核心函数
- `fetchCourseTeacherFromBackend(courseId)` - 获取单个课程教师
- `fetchTeachersForCoursesFromBackend(courses)` - 批量获取教师
- `enrichRecommendedCoursesWithTeacherData(courses)` - 为推荐课程丰富教师数据

#### 数据获取策略
1. **优先批量获取**：使用 `/api/courses/teachers` 批量获取，减少网络请求
2. **降级单个获取**：批量失败的课程单独调用 `/api/courses/{courseId}/teacher`
3. **错误fallback**：如果后端API不可用，降级使用原有的修复工具

### 3. 响应数据格式

#### 单个课程教师响应
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "teacher_name": "张教授",
    "title": "副教授",
    "department": "计算机科学系",
    "email": "zhang@university.edu",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "从事前端开发教学15年..."
  }
}
```

#### 批量教师响应
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "course_id": 1,
      "teacher_name": "张教授",
      "title": "副教授",
      "department": "计算机科学系"
    },
    {
      "course_id": 2,
      "teacher_name": "李教授",
      "title": "教授",
      "department": "软件工程系"
    }
  ]
}
```

### 4. 代码修改

#### 4.1 选课页面 (CourseSelection.vue)
```javascript
// 导入新的教师数据工具
import { enrichRecommendedCoursesWithTeacherData } from '@/utils/teacherDataBackend.js'

// 替换原有的教师数据修复逻辑
const fixedCourses = await enrichRecommendedCoursesWithTeacherData(courses)
```

#### 4.2 教师字段处理优化
```javascript
// 优先使用从后端获取的教师数据
teacher: courseDetail.teacher || course.teacherInfo?.name || course.teacher || '未知教师'
```

### 5. 后端实现要求

#### 5.1 数据库表结构建议
```sql
-- 课程表
CREATE TABLE courses (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  teacher_id INT,
  -- 其他课程字段
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- 教师表
CREATE TABLE teachers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  title VARCHAR(100),
  department VARCHAR(100),
  email VARCHAR(100),
  avatar VARCHAR(255),
  bio TEXT
);
```

#### 5.2 API实现要点
1. **单个教师API**：根据课程ID查询教师信息
2. **批量教师API**：接收课程ID数组，返回对应的教师信息
3. **数据验证**：确保返回的教师信息完整性
4. **错误处理**：当教师信息不存在时返回默认值

### 6. 测试和验证

#### 6.1 功能测试
```javascript
// 运行测试
import { testTeacherDataBackend } from '@/utils/testTeacherBackend.js'
testTeacherDataBackend()
```

#### 6.2 验证要点
- [ ] API端点响应正常
- [ ] 教师数据完整获取
- [ ] 批量获取效率
- [ ] 错误情况处理
- [ ] 数据格式正确

### 7. 性能优化

#### 7.1 请求优化
- 批量获取减少网络请求次数
- 添加请求间隔避免频率限制
- 实现数据缓存机制

#### 7.2 用户体验
- 异步加载避免阻塞UI
- 添加加载状态提示
- 优雅降级处理

### 8. 监控和日志

#### 8.1 关键日志
```
👨‍🏫 从后端获取课程 {courseId} 的教师信息...
📝 课程 {courseId} 教师响应: {response}
✅ 课程 {courseId} 教师信息获取成功: {teacherName}
```

#### 8.2 错误监控
- API调用失败率
- 教师数据完整性统计
- 用户反馈收集

## 使用步骤

1. **后端实现API端点**
2. **部署数据库结构**
3. **测试API功能**
4. **启用前端代码**
5. **监控运行状态**

## 预期效果

- ✅ 推荐课程显示真实的指导教师信息
- ✅ 教师数据来源可靠（后端数据库）
- ✅ 支持批量获取，性能优化
- ✅ 错误处理机制完善
- ✅ 用户体验良好