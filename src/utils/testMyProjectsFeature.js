// 测试我的项目功能
console.log('🧪 测试我的项目功能逻辑...\n')

// 模拟 API 响应数据
const mockMyProjectsResponse = {
  code: 200,
  message: '获取成功',
  data: [
    {
      id: 1,
      name: '电商平台前端开发',
      description: '参与大型电商平台的前端开发，使用Vue3+TypeScript构建现代化的用户界面，实现购物车、订单管理等核心功能。',
      company: '阿里巴巴',
      type: 'Web开发',
      difficulty: '中级',
      duration: 12,
      credits: 1,
      startDate: '2024-03-01',
      enrolled: 15,
      capacity: 20,
      status: '进行中',
      applied: true,
      skills: ['Vue.js', 'TypeScript', 'Element Plus', 'Vite'],
      content: [
        '参与电商平台前端架构设计',
        '实现商品展示、购物车、订单等核心功能',
        '优化页面性能和用户体验',
        '与后端团队协作完成接口对接'
      ],
      gains: [
        '掌握大型项目的前端开发流程',
        '提升Vue3和TypeScript实战能力',
        '学习企业级代码规范和最佳实践',
        '获得1学分'
      ]
    },
    {
      id: 2,
      name: '移动端App开发',
      description: '使用React Native开发跨平台移动应用，实现用户注册登录、内容浏览、社交互动等功能模块。',
      company: '腾讯',
      type: '移动开发',
      difficulty: '中级',
      duration: 16,
      credits: 1,
      startDate: '2024-03-15',
      enrolled: 18,
      capacity: 25,
      status: '已结束',
      applied: true,
      completed: true,
      skills: ['React Native', 'JavaScript', 'Redux', 'Node.js'],
      content: [
        '使用React Native开发移动应用',
        '实现用户认证和权限管理',
        '开发内容浏览和社交功能',
        '进行应用性能优化和测试'
      ],
      gains: [
        '掌握移动端开发技术',
        '学习跨平台开发方案',
        '了解移动应用发布流程',
        '获得1学分'
      ]
    },
    {
      id: 3,
      name: '智能推荐系统',
      description: '基于机器学习算法开发个性化推荐系统，使用协同过滤和深度学习技术提升推荐准确率。',
      company: '字节跳动',
      type: '人工智能',
      difficulty: '高级',
      duration: 14,
      credits: 1,
      startDate: '2024-04-01',
      enrolled: 8,
      capacity: 15,
      status: '可报名',
      applied: false,
      skills: ['Python', 'TensorFlow', '机器学习', '推荐算法'],
      content: [
        '研究推荐算法原理',
        '实现协同过滤算法',
        '使用深度学习优化推荐效果',
        '评估和优化推荐系统性能'
      ],
      gains: [
        '深入理解推荐系统原理',
        '掌握机器学习实战应用',
        '学习模型训练和优化',
        '获得1学分'
      ]
    }
  ]
}

console.log('🔹 测试数据结构')
console.log('响应数据:', JSON.stringify(mockMyProjectsResponse, null, 2))

// 测试数据处理逻辑
console.log('\n🔹 测试数据处理逻辑')

const response = mockMyProjectsResponse
let myProjects = []

if (response && response.data) {
  if (Array.isArray(response.data)) {
    myProjects = response.data
  } else if (response.data.list && Array.isArray(response.data.list)) {
    myProjects = response.data.list
  } else if (response.data.projects && Array.isArray(response.data.projects)) {
    myProjects = response.data.projects
  } else {
    console.warn('⚠️ 无法识别的数据格式')
    myProjects = []
  }
}

console.log(`✅ 成功处理 ${myProjects.length} 个我的项目`)
console.log('项目列表:', myProjects.map(p => ({
  id: p.id,
  name: p.name,
  status: p.status,
  applied: p.applied,
  completed: p.completed
})))

// 测试统计计算
console.log('\n🔹 测试统计计算 - 我的项目')

const availableProjects = myProjects.filter(p => p.status === '可报名' && !p.applied).length
const appliedProjects = myProjects.filter(p => p.applied === true || p.status === '已报名' || p.status === '申请中').length
const completedProjects = myProjects.filter(p => p.status === '已结束' || p.completed === true).length
const inProgressProjects = myProjects.filter(p => p.status === '进行中').length

const creditsEarned = myProjects
  .filter(p => p.status === '已结束' || p.completed === true)
  .reduce((total, project) => total + (project.credits || 1), 0)

console.log('📊 统计数据:', {
  '可报名项目': availableProjects,
  '已报名项目': appliedProjects,
  '已完成项目': completedProjects,
  '进行中项目': inProgressProjects,
  '获得学分': creditsEarned,
  '总项目数': myProjects.length
})

// 测试按钮状态逻辑
console.log('\n🔹 测试按钮状态逻辑 - 我的项目')

myProjects.forEach(project => {
  let primaryAction, secondaryAction
  
  if (project.status === '已结束' || project.completed === true) {
    primaryAction = { text: '查看详情', type: 'default', action: 'view' }
    secondaryAction = { text: '项目评价', type: 'info', action: 'evaluate' }
  } else if (project.status === '进行中') {
    primaryAction = { text: '查看详情', type: 'default', action: 'view' }
    secondaryAction = { text: '查看进度', type: 'info', action: 'progress' }
  } else if (project.applied === true || project.status === '已报名' || project.status === '申请中') {
    primaryAction = { text: '查看详情', type: 'default', action: 'view' }
    secondaryAction = { text: '查看进度', type: 'info', action: 'progress' }
  } else {
    // 可报名状态
    primaryAction = { text: '立即报名', type: 'primary', action: 'apply' }
    secondaryAction = { text: '查看详情', type: 'default', action: 'view' }
  }
  
  console.log(`${project.name} (${project.status}):`)
  console.log(`  primary: ${JSON.stringify(primaryAction)}`)
  console.log(`  secondary: ${JSON.stringify(secondaryAction)}`)
})

console.log('\n🎉 我的项目功能测试完成！')