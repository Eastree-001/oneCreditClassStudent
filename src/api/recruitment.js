import request from '@/utils/request'

// 模拟数据
const mockRecruitments = [
  {
    id: 1,
    title: '2025前端开发岗招聘',
    status: '已结束',
    positionName: '前端开发工程师',
    requiredNumber: 5,
    location: '北京',
    salaryRange: '15-25k',
    educationRequirement: '本科',
    deadline: '2025-06-30',
    description: '负责公司Vue.js项目开发，参与前端架构设计，优化用户体验。\n\n岗位职责：\n1. 负责公司前端项目的开发和维护\n2. 参与产品需求讨论，提供技术方案\n3. 优化前端性能，提升用户体验\n4. 与后端团队协作，完成接口对接',
    skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML5', 'TypeScript'],
    applicationCount: 23,
    viewCount: 156,
    createdAt: '2024-11-01T09:00:00',
    updatedAt: null
  },
  {
    id: 2,
    title: '2025后端开发工程师招聘',
    status: '招聘中',
    positionName: 'Java后端开发工程师',
    requiredNumber: 3,
    location: '上海',
    salaryRange: '20-30k',
    educationRequirement: '本科',
    deadline: '2025-12-31',
    description: '负责公司后端服务开发，参与系统架构设计。\n\n岗位职责：\n1. 负责后端API的设计和开发\n2. 参与数据库设计和优化\n3. 保证系统稳定性和性能\n4. 编写技术文档',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', '微服务'],
    applicationCount: 15,
    viewCount: 89,
    createdAt: '2025-01-15T10:00:00',
    updatedAt: '2025-01-20T14:30:00'
  },
  {
    id: 3,
    title: '2025全栈开发工程师招聘',
    status: '招聘中',
    positionName: '全栈开发工程师',
    requiredNumber: 2,
    location: '深圳',
    salaryRange: '25-35k',
    educationRequirement: '本科',
    deadline: '2025-12-31',
    description: '负责前后端全栈开发，参与产品全生命周期。\n\n岗位职责：\n1. 负责前后端全栈开发\n2. 参与产品设计和需求分析\n3. 独立完成功能模块开发\n4. 代码审查和技术分享',
    skills: ['Vue.js', 'React', 'Node.js', 'Python', 'Docker'],
    applicationCount: 8,
    viewCount: 45,
    createdAt: '2025-01-10T08:00:00',
    updatedAt: null
  },
  {
    id: 4,
    title: '2025数据分析师招聘',
    status: '招聘中',
    positionName: '数据分析师',
    requiredNumber: 4,
    location: '杭州',
    salaryRange: '18-28k',
    educationRequirement: '硕士',
    deadline: '2025-11-30',
    description: '负责公司数据分析和挖掘工作。\n\n岗位职责：\n1. 负责业务数据分析，提供数据支持\n2. 构建数据分析模型\n3. 编写数据分析报告\n4. 与业务团队协作，提供数据洞察',
    skills: ['Python', 'SQL', 'Excel', 'Tableau', '机器学习'],
    applicationCount: 12,
    viewCount: 67,
    createdAt: '2025-01-05T09:00:00',
    updatedAt: '2025-01-18T16:20:00'
  },
  {
    id: 5,
    title: '2025UI/UX设计师招聘',
    status: '招聘中',
    positionName: 'UI/UX设计师',
    requiredNumber: 2,
    location: '广州',
    salaryRange: '12-20k',
    educationRequirement: '本科',
    deadline: '2025-10-31',
    description: '负责产品界面设计和用户体验优化。\n\n岗位职责：\n1. 负责产品UI设计\n2. 进行用户研究和体验设计\n3. 与开发团队协作，确保设计实现\n4. 参与产品设计规范制定',
    skills: ['Figma', 'Sketch', 'Photoshop', '用户体验设计'],
    applicationCount: 6,
    viewCount: 34,
    createdAt: '2025-01-08T11:00:00',
    updatedAt: null
  },
  {
    id: 6,
    title: '2025测试工程师招聘',
    status: '招聘中',
    positionName: '测试工程师',
    requiredNumber: 3,
    location: '成都',
    salaryRange: '10-18k',
    educationRequirement: '专科',
    deadline: '2025-09-30',
    description: '负责产品测试和质量保证。\n\n岗位职责：\n1. 编写测试用例和执行测试\n2. 进行自动化测试开发\n3. 跟踪和报告Bug\n4. 参与测试流程优化',
    skills: ['测试用例设计', '自动化测试', 'Selenium', 'Jmeter'],
    applicationCount: 9,
    viewCount: 52,
    createdAt: '2025-01-12T13:00:00',
    updatedAt: '2025-01-19T10:15:00'
  }
]

const mockApplications = [
  {
    id: 1,
    recruitment: {
      ...mockRecruitments[1],
      applicationStatus: '待审核'
    },
    status: '待审核',
    appliedAt: '2025-01-20T10:00:00'
  },
  {
    id: 2,
    recruitment: {
      ...mockRecruitments[3],
      applicationStatus: '已通过'
    },
    status: '已通过',
    appliedAt: '2025-01-15T14:30:00'
  }
]

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 企业直聘相关API（临时使用模拟数据）
export const recruitmentApi = {
  // 获取人才需求列表
  async getRecruitments(params) {
    console.log('📋 [模拟数据] 获取人才需求列表，参数:', params)
    await delay()
    
    let result = [...mockRecruitments]
    
    // 模拟筛选
    if (params?.location) {
      result = result.filter(r => r.location === params.location)
    }
    if (params?.education) {
      result = result.filter(r => r.educationRequirement === params.education)
    }
    if (params?.status) {
      result = result.filter(r => r.status === params.status)
    }
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(r => 
        r.title.toLowerCase().includes(keyword) ||
        r.positionName.toLowerCase().includes(keyword)
      )
    }
    
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  },
  
  // 获取人才需求详情
  async getRecruitmentDetail(recruitmentId) {
    console.log(`🔍 [模拟数据] 获取人才需求详情: ${recruitmentId}`)
    await delay()
    
    const recruitment = mockRecruitments.find(r => r.id === parseInt(recruitmentId))
    
    if (!recruitment) {
      return {
        code: 404,
        message: '职位不存在',
        data: null
      }
    }
    
    return {
      code: 200,
      message: '获取成功',
      data: recruitment
    }
  },
  
  // 申请职位
  async applyRecruitment(recruitmentId, data) {
    console.log(`📝 [模拟数据] 申请职位: ${recruitmentId}`, data)
    await delay(1000)
    
    const recruitment = mockRecruitments.find(r => r.id === parseInt(recruitmentId))
    
    if (!recruitment) {
      return {
        code: 404,
        message: '职位不存在'
      }
    }
    
    if (recruitment.status !== '招聘中') {
      return {
        code: 400,
        message: '该职位已结束招聘'
      }
    }
    
    // 模拟增加申请人数
    recruitment.applicationCount = (recruitment.applicationCount || 0) + 1
    
    return {
      code: 200,
      message: '申请提交成功',
      data: {
        id: Date.now(),
        recruitmentId: parseInt(recruitmentId),
        status: '待审核'
      }
    }
  },
  
  // 获取我的申请列表
  async getMyApplications(params) {
    console.log('📋 [模拟数据] 获取我的申请列表', params)
    await delay()
    
    let result = [...mockApplications]
    
    // 模拟筛选
    if (params?.status) {
      result = result.filter(app => app.status === params.status)
    }
    
    return {
      code: 200,
      message: '获取成功',
      data: result
    }
  },
  
  // 取消申请
  async cancelApplication(applicationId) {
    console.log(`❌ [模拟数据] 取消申请: ${applicationId}`)
    await delay(800)
    
    const applicationIndex = mockApplications.findIndex(app => app.id === parseInt(applicationId))
    
    if (applicationIndex === -1) {
      return {
        code: 404,
        message: '申请不存在'
      }
    }
    
    if (mockApplications[applicationIndex].status !== '待审核') {
      return {
        code: 400,
        message: '只能取消待审核状态的申请'
      }
    }
    
    mockApplications.splice(applicationIndex, 1)
    
    return {
      code: 200,
      message: '取消成功'
    }
  },
  
  // 增加浏览次数
  async incrementViews(recruitmentId) {
    console.log(`👁️ [模拟数据] 增加浏览次数: ${recruitmentId}`)
    await delay(300)
    
    const recruitment = mockRecruitments.find(r => r.id === parseInt(recruitmentId))
    
    if (recruitment) {
      recruitment.viewCount = (recruitment.viewCount || 0) + 1
    }
    
    return {
      code: 200,
      message: '成功'
    }
  }
}

