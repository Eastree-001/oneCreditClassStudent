# 项目删除报名功能使用指南

## 功能概述
在项目实训界面的"我的项目"模式下，用户可以删除已报名的项目。删除按钮位于每个项目卡片的"查看详情"按钮旁边。

## 使用方法
1. 进入"项目实训"页面
2. 点击"我的项目"按钮切换到我的项目视图
3. 找到要删除报名的项目
4. 点击红色"删除报名"按钮
5. 在确认对话框中点击"确定删除"

## 技术实现

### 前端实现
- **组件位置**: `src/views/ProjectTraining.vue`
- **API调用**: `projectApi.cancelProjectApplication(projectId)`
- **请求方式**: `DELETE /api/projects/{projectId}/apply`

### 关键代码片段

#### 删除按钮
```vue
<el-button
  type="danger"
  @click="handleDeleteProject(project)"
  v-if="showMyProjects"
  :loading="deleting && deletingProjectId === project.id"
>
  <el-icon><Delete /></el-icon>
  删除报名
</el-button>
```

#### 删除方法
```javascript
const handleDeleteProject = async (project) => {
  try {
    // 状态验证
    if (!validateProjectDeletion(project)) {
      return
    }

    // 确认对话框
    await ElMessageBox.confirm(
      `确定要删除报名「${project.name}」吗？删除后将无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 调用API删除
    const response = await projectApi.cancelProjectApplication(project.id)
    
    // 更新界面数据
    const index = myProjects.value.findIndex(p => p.id === project.id)
    if (index > -1) {
      myProjects.value.splice(index, 1)
    }

    // 刷新统计数据
    fetchProjectStats()

    ElMessage.success('✅ 删除报名成功！')

  } catch (error) {
    // 详细的错误处理
    if (error === 'cancel') {
      return // 用户取消
    }
    
    // 根据HTTP状态码显示不同错误信息
    // ...
  }
}
```

## 状态验证
删除前会验证项目状态，只有以下状态的项目可以删除报名：
- '可报名'
- '申请中' 
- '已报名'

以下状态的项目不允许删除报名：
- '进行中' - 项目已开始，无法删除报名
- '已结束' - 项目已结束，无法删除报名
- '已完成' - 项目已完成，无法删除报名

## 错误处理

### 常见错误类型
1. **400 Bad Request** - 请求参数错误或项目状态不允许删除
2. **401 Unauthorized** - 登录已过期，需要重新登录
3. **403 Forbidden** - 权限不足
4. **404 Not Found** - 项目报名不存在
5. **500 Internal Server Error** - 服务器内部错误

### 错误信息示例
```
❌ 删除报名失败
取消报名失败

💡 项目已开始，请联系管理员处理
```

### 调试信息
删除操作会记录详细的调试日志：
- 项目基本信息
- API请求和响应
- 错误详情
- 状态验证结果

## API接口

### 请求
```http
DELETE /api/projects/{projectId}/apply
Authorization: Bearer {token}
Content-Type: application/json
```

### 成功响应
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "取消报名失败",
  "data": null,
  "errors": {
    "message": "项目已开始，无法取消报名"
  }
}
```

## 数据更新
删除成功后会自动：
1. 从我的项目列表中移除该项目
2. 更新全部项目中对应项目的报名人数（减1）
3. 刷新统计数据
4. 显示成功消息

## 用户体验优化
1. **确认对话框** - 防止误操作
2. **加载状态** - 删除过程中按钮显示加载状态
3. **详细错误提示** - 根据错误类型提供具体建议
4. **自动刷新** - 检测到数据过期时提示用户刷新页面

## 故障排除

### 如果遇到400错误
1. 检查项目状态是否允许删除
2. 确认用户是否有权限删除该报名
3. 查看后端日志了解具体错误原因
4. 可能需要联系管理员处理

### 如果删除后数据未更新
1. 手动刷新页面
2. 检查网络连接
3. 查看浏览器控制台是否有JavaScript错误

### 如果按钮不可点击
1. 确认当前在"我的项目"模式下
2. 检查是否有其他操作正在进行
3. 刷新页面重试

## 后续优化建议
1. 添加删除操作的撤销功能
2. 支持批量删除多个项目报名
3. 添加删除操作记录和历史
4. 优化移动端的操作体验