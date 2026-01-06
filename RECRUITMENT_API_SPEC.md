# 企业直聘后端接口规范

## 概述
本文档描述了企业直聘功能所需的后端接口规范。当前前端使用模拟数据，后端实现后需要替换为真实API调用。

## 数据库表结构

### 1. 人才需求表（recruitments）

```sql
CREATE TABLE recruitments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL COMMENT '需求标题',
  status VARCHAR(20) NOT NULL DEFAULT '招聘中' COMMENT '状态：招聘中/已结束',
  position_name VARCHAR(100) NOT NULL COMMENT '岗位名称',
  required_number INT NOT NULL COMMENT '需求人数',
  location VARCHAR(50) NOT NULL COMMENT '工作地点',
  salary_range VARCHAR(50) NOT NULL COMMENT '薪资范围',
  education_requirement VARCHAR(20) NOT NULL COMMENT '学历要求：专科/本科/硕士/博士',
  deadline DATE NOT NULL COMMENT '截止日期',
  description TEXT COMMENT '岗位描述',
  skills JSON COMMENT '技能要求数组',
  application_count INT DEFAULT 0 COMMENT '申请人数',
  view_count INT DEFAULT 0 COMMENT '浏览次数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_status (status),
  INDEX idx_location (location),
  INDEX idx_education (education_requirement),
  INDEX idx_created_at (created_at)
) COMMENT='人才需求表';
```

### 2. 职位申请表（recruitment_applications）

```sql
CREATE TABLE recruitment_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recruitment_id BIGINT NOT NULL COMMENT '职位ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  name VARCHAR(50) NOT NULL COMMENT '姓名',
  student_id VARCHAR(50) NOT NULL COMMENT '学号',
  phone VARCHAR(20) NOT NULL COMMENT '联系方式',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  resume TEXT NOT NULL COMMENT '个人简历',
  status VARCHAR(20) DEFAULT '待审核' COMMENT '状态：待审核/已通过/已拒绝/已录用',
  review_comment VARCHAR(255) COMMENT '审核意见',
  reviewed_at DATETIME COMMENT '审核时间',
  reviewed_by BIGINT COMMENT '审核人ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_recruitment_id (recruitment_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (recruitment_id) REFERENCES recruitments(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='职位申请表';
```

## API接口规范

### 1. 获取人才需求列表

**接口地址：** `GET /api/recruitments`

**请求参数：**
```json
{
  "page": 1,              // 可选，页码，默认1
  "pageSize": 20,         // 可选，每页数量，默认20
  "location": "北京",     // 可选，工作地点筛选
  "education": "本科",    // 可选，学历要求筛选
  "status": "招聘中",    // 可选，状态筛选
  "keyword": "前端"      // 可选，关键词搜索（搜索标题、岗位名称）
}
```

**响应格式：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "title": "2025前端开发岗招聘",
      "status": "招聘中",
      "positionName": "前端开发工程师",
      "requiredNumber": 5,
      "location": "北京",
      "salaryRange": "15-25k",
      "educationRequirement": "本科",
      "deadline": "2025-06-30",
      "description": "负责公司Vue.js项目开发...",
      "skills": ["Vue.js", "JavaScript", "CSS"],
      "applicationCount": 23,
      "viewCount": 156,
      "createdAt": "2024-11-01T09:00:00",
      "updatedAt": "2025-01-20T14:30:00"
    }
  ],
  "total": 100  // 可选，总数（分页时）
}
```

### 2. 获取人才需求详情

**接口地址：** `GET /api/recruitments/:id`

**路径参数：**
- `id`: 职位ID

**响应格式：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "title": "2025前端开发岗招聘",
    "status": "招聘中",
    "positionName": "前端开发工程师",
    "requiredNumber": 5,
    "location": "北京",
    "salaryRange": "15-25k",
    "educationRequirement": "本科",
    "deadline": "2025-06-30",
    "description": "负责公司Vue.js项目开发...",
    "skills": ["Vue.js", "JavaScript", "CSS", "HTML5"],
    "applicationCount": 23,
    "viewCount": 156,
    "createdAt": "2024-11-01T09:00:00",
    "updatedAt": "2025-01-20T14:30:00"
  }
}
```

**错误响应：**
```json
{
  "code": 404,
  "message": "职位不存在"
}
```

### 3. 申请职位

**接口地址：** `POST /api/recruitments/:id/apply`

**路径参数：**
- `id`: 职位ID

**请求体：**
```json
{
  "name": "张三",
  "studentId": "2021001",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "resume": "个人简历内容..."
}
```

**响应格式：**
```json
{
  "code": 200,
  "message": "申请提交成功",
  "data": {
    "id": 123,
    "recruitmentId": 1,
    "status": "待审核"
  }
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "该职位已结束招聘"
}
```

```json
{
  "code": 409,
  "message": "您已经申请过该职位"
}
```

### 4. 获取我的申请列表

**接口地址：** `GET /api/recruitments/my-applications`

**请求参数：**
```json
{
  "page": 1,              // 可选，页码
  "pageSize": 20,        // 可选，每页数量
  "status": "待审核"     // 可选，状态筛选
}
```

**响应格式：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "recruitment": {
        "id": 2,
        "title": "2025后端开发工程师招聘",
        "status": "招聘中",
        "positionName": "Java后端开发工程师",
        "location": "上海",
        "salaryRange": "20-30k"
      },
      "status": "待审核",
      "appliedAt": "2025-01-20T10:00:00"
    }
  ],
  "total": 10  // 可选
}
```

### 5. 取消申请

**接口地址：** `DELETE /api/recruitments/applications/:id`

**路径参数：**
- `id`: 申请ID

**响应格式：**
```json
{
  "code": 200,
  "message": "取消成功"
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "只能取消待审核状态的申请"
}
```

```json
{
  "code": 404,
  "message": "申请不存在"
}
```

### 6. 增加浏览次数

**接口地址：** `POST /api/recruitments/:id/views`

**路径参数：**
- `id`: 职位ID

**响应格式：**
```json
{
  "code": 200,
  "message": "成功"
}
```

**说明：** 每次调用该接口，对应职位的 `view_count` 字段 +1

## 业务逻辑说明

### 1. 申请职位流程
1. 用户填写申请表单（姓名、学号、联系方式、邮箱、个人简历）
2. 验证职位状态是否为"招聘中"
3. 检查用户是否已申请过该职位（避免重复申请）
4. 创建申请记录，状态为"待审核"
5. 职位表的 `application_count` +1
6. 返回申请成功信息

### 2. 取消申请
- 只能取消状态为"待审核"的申请
- 取消后，职位表的 `application_count` -1
- 删除申请记录（或标记为已取消）

### 3. 浏览次数统计
- 用户查看职位详情时调用该接口
- 每次调用 `view_count` +1
- 可以使用Redis缓存，避免频繁更新数据库

### 4. 发布天数计算
- 前端会根据 `createdAt` 自动计算发布天数
- 后端也可以直接返回 `publishedDays` 字段

### 5. 状态管理
- **职位状态：** 招聘中、已结束
- **申请状态：** 待审核、已通过、已拒绝、已录用

## 数据字段说明

### 字段命名规范
- 数据库使用下划线命名：`position_name`, `required_number`
- API返回使用驼峰命名：`positionName`, `requiredNumber`
- 需要在后端进行字段转换

### 技能要求字段
- 数据库存储为JSON格式：`["Vue.js", "JavaScript", "CSS"]`
- 如果没有技能要求，返回空数组 `[]` 或 `null`

### 时间字段
- 数据库使用 `DATETIME` 类型
- API返回ISO 8601格式：`"2024-11-01T09:00:00"`
- 如果 `updatedAt` 为空，返回 `null` 或字符串 `"暂无更新"`

## 权限说明

- 所有接口需要用户登录认证（Bearer Token）
- `GET /api/recruitments` - 公开接口，未登录也可查看
- `GET /api/recruitments/:id` - 公开接口，未登录也可查看
- `POST /api/recruitments/:id/views` - 公开接口
- 其他接口需要登录

## 替换模拟数据

当前前端在 `src/api/recruitment.js` 中使用模拟数据。后端实现后，需要：

1. 将 `recruitmentApi` 中的方法改为调用真实API
2. 使用 `request.get()`, `request.post()`, `request.delete()` 等方法
3. 参考 `src/api/project.js` 的实现方式

示例：
```javascript
// 替换前（模拟数据）
async getRecruitments(params) {
  await delay()
  return { code: 200, data: mockRecruitments }
}

// 替换后（真实API）
getRecruitments(params) {
  console.log('📋 获取人才需求列表，参数:', params)
  return request.get('/recruitments', { params })
}
```

## 注意事项

1. **分页处理：** 如果数据量大，建议实现分页功能
2. **搜索优化：** 关键词搜索建议使用全文索引
3. **性能优化：** 浏览次数可以使用Redis缓存，定期同步到数据库
4. **数据校验：** 申请表单需要验证手机号、邮箱格式
5. **防重复申请：** 需要检查用户是否已申请过该职位

