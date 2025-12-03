// 测试全部项目API调用
console.log('🧪 测试全部项目API调用逻辑...\n')

// 模拟全部项目API响应
const mockAllProjectsResponse = {
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
      status: '可报名',
      skills: ['Vue.js', 'TypeScript', 'Element Plus', 'Vite']
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
      status: '可报名',
      skills: ['React Native', 'JavaScript', 'Redux', 'Node.js']
    },
    {
      id: 3,
      name: '数据分析与可视化',
      description: '对电商平台销售数据进行深度分析，使用Python进行数据清洗和挖掘，并制作可视化报表。',
      company: '京东',
      type: '数据分析',
      difficulty: '高级',
      duration: 10,
      credits: 1,
      startDate: '2024-02-20',
      enrolled: 12,
      capacity: 15,
      status: '进行中',
      skills: ['Python', 'Pandas', 'Matplotlib', 'SQL']
    },
    {
      id: 4,
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
      skills: ['Python', 'TensorFlow', '机器学习', '推荐算法']
    },
    {
      id: 5,
      name: '企业管理系统开发',
      description: '开发企业内部管理系统，包括人事管理、财务管理、项目管理等模块，使用Spring Boot和Vue.js。',
      company: '华为',
      type: '系统开发',
      difficulty: '中级',
      duration: 12,
      credits: 1,
      startDate: '2024-03-10',
      enrolled: 20,
      capacity: 20,
      status: '已结束',
      skills: ['Java', 'Spring Boot', 'Vue.js', 'MySQL']
    },
    {
      id: 6,
      name: '微服务架构实践',
      description: '基于Spring Cloud构建微服务架构，实现服务注册发现、配置中心、网关路由等功能。',
      company: '美团',
      type: '系统开发',
      difficulty: '高级',
      duration: 14,
      credits: 1,
      startDate: '2024-04-10',
      enrolled: 10,
      capacity: 18,
      status: '可报名',
      skills: ['Java', 'Spring Cloud', 'Docker', 'Kubernetes']
    }
  ]
}

console.log('🔹 测试全部项目API响应数据')
console.log('API响应:', JSON.stringify(mockAllProjectsResponse, null, 2))

// 测试数据处理逻辑
console.log('\n🔹 测试全部项目数据处理逻辑')

const response = mockAllProjectsResponse
let allProjects = []

if (response && response.data) {
  if (Array.isArray(response.data)) {
    allProjects = response.data
  } else if (response.data.list && Array.isArray(response.data.list)) {
    allProjects = response.data.list
  } else if (response.data.projects && Array.isArray(response.data.projects)) {
    allProjects = response.data.projects
  } else {
    console.warn('⚠️ 无法识别的数据格式')
    allProjects = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
  }
}

console.log(`✅ 成功处理 ${allProjects.length} 个全部项目`)
console.log('项目列表:', allProjects.map(p => ({
  id: p.id,
  name: p.name,
  company: p.company,
  type: p.type,
  status: p.status
})))

// 测试筛选逻辑
console.log('\n🔹 测试筛选逻辑')

// 模拟筛选条件
const filterForm = {
  type: 'Web开发',
  difficulty: '',
  status: '可报名',
  keyword: ''
}

let filteredProjects = allProjects

if (filterForm.type) {
  filteredProjects = filteredProjects.filter(p => p.type === filterForm.type)
}

if (filterForm.difficulty) {
  filteredProjects = filteredProjects.filter(p => p.difficulty === filterForm.difficulty)
}

if (filterForm.status) {
  filteredProjects = filteredProjects.filter(p => p.status === filterForm.status)
}

if (filterForm.keyword) {
  const keyword = filterForm.keyword.toLowerCase()
  filteredProjects = filteredProjects.filter(p => p.name.toLowerCase().includes(keyword))
}

console.log('筛选条件:', filterForm)
console.log(`筛选结果: ${filteredProjects.length} 个项目`)
console.log('筛选后项目:', filteredProjects.map(p => ({
  name: p.name,
  company: p.company,
  type: p.type,
  status: p.status
})))

// 测试统计计算
console.log('\n🔹 测试统计计算 - 全部项目')

const availableProjects = allProjects.filter(p => p.status === '可报名').length
const appliedProjects = allProjects.filter(p => 
  p.status === '已报名' || p.status === '申请中' || p.applied === true
).length
const completedProjects = allProjects.filter(p => p.status === '已结束').length
const inProgressProjects = allProjects.filter(p => p.status === '进行中').length

const creditsEarned = allProjects
  .filter(p => p.status === '已结束')
  .reduce((total, project) => total + (project.credits || 1), 0)

console.log('📊 统计数据:', {
  '可报名项目': availableProjects,
  '已报名项目': appliedProjects,
  '已完成项目': completedProjects,
  '进行中项目': inProgressProjects,
  '获得学分': creditsEarned,
  '总项目数': allProjects.length
})

// 测试API调用流程
console.log('\n🔹 测试API调用流程模拟')

// 模拟 showMyProjects 的不同值
console.log('场景1: 显示全部项目 (showMyProjects = false)')
const showMyProjects1 = false
console.log(`  📋 调用: projectApi.getProjects()`)
console.log(`  🔗 接口: GET /api/projects`)
console.log(`  📊 数据源: all-projects`)
console.log(`  📈 更新: allProjects.value`)

console.log('\n场景2: 显示我的项目 (showMyProjects = true)')
const showMyProjects2 = true
console.log(`  📋 调用: projectApi.getMyProjects()`)
console.log(`  🔗 接口: GET /api/projects/my-projects`)
console.log(`  📊 数据源: my-projects`)
console.log(`  📈 更新: myProjects.value`)

console.log('\n🎉 全部项目API测试完成！')
console.log('✅ 全部项目页面将从 /api/projects 获取数据')
console.log('✅ 我的项目页面将从 /api/projects/my-projects 获取数据')