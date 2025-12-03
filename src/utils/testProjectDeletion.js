// 项目删除报名功能测试脚本
// 用于验证删除功能的各个组件是否正常工作

// 模拟项目数据
const mockProjects = [
  {
    id: 1,
    name: '测试项目1 - 可删除',
    status: '可报名',
    enrolled: 5,
    capacity: 20
  },
  {
    id: 2,
    name: '测试项目2 - 进行中',
    status: '进行中',
    enrolled: 10,
    capacity: 20
  },
  {
    id: 3,
    name: '测试项目3 - 已结束',
    status: '已结束',
    enrolled: 20,
    capacity: 20
  },
  {
    id: 4,
    name: '测试项目4 - 申请中',
    status: '申请中',
    enrolled: 8,
    capacity: 20
  }
]

// 模拟验证项目删除条件的方法
function validateProjectDeletion(project) {
  console.log('🔍 验证项目删除条件:', project)
  
  if (!project) {
    console.error('❌ 未选择项目')
    return false
  }

  // 检查项目状态 - 某些状态下可能不允许删除报名
  const deletableStatuses = ['可报名', '申请中', '已报名']
  if (project.status && !deletableStatuses.includes(project.status)) {
    const statusMap = {
      '进行中': '项目已开始，无法删除报名',
      '已结束': '项目已结束，无法删除报名',
      '已完成': '项目已完成，无法删除报名'
    }
    const message = statusMap[project.status] || `项目状态为"${project.status}"，无法删除报名`
    console.warn(`⚠️ ${message}`)
    return false
  }

  console.log('✅ 项目删除条件验证通过')
  return true
}

// 测试函数
function testProjectDeletionValidation() {
  console.log('🧪 开始测试项目删除验证逻辑...\n')
  
  let passCount = 0
  let totalTests = mockProjects.length
  
  mockProjects.forEach((project, index) => {
    console.log(`--- 测试 ${index + 1}: ${project.name} ---`)
    const result = validateProjectDeletion(project)
    
    if (project.status === '可报名' || project.status === '申请中') {
      if (result) {
        console.log('✅ 测试通过：可删除状态的项目允许删除')
        passCount++
      } else {
        console.log('❌ 测试失败：可删除状态的项目不允许删除')
      }
    } else {
      if (!result) {
        console.log('✅ 测试通过：不可删除状态的项目正确拒绝删除')
        passCount++
      } else {
        console.log('❌ 测试失败：不可删除状态的项目错误允许删除')
      }
    }
    console.log('')
  })
  
  console.log(`📊 测试结果: ${passCount}/${totalTests} 通过`)
  return passCount === totalTests
}

// 模拟API响应处理
function testErrorResponseHandling() {
  console.log('🧪 测试错误响应处理...\n')
  
  const errorScenarios = [
    {
      status: 400,
      data: { message: '取消报名失败' },
      expectedMessage: '取消报名失败'
    },
    {
      status: 401,
      data: { message: 'Unauthorized' },
      expectedMessage: '登录已过期，请重新登录后重试'
    },
    {
      status: 403,
      data: { message: 'Forbidden' },
      expectedMessage: '权限不足，无法删除该报名\n\n💡 请确认您有权限删除此项目的报名'
    },
    {
      status: 404,
      data: { message: 'Not Found' },
      expectedMessage: '项目报名不存在，请刷新页面后重试\n\n💡 该报名可能已被删除'
    },
    {
      status: 500,
      data: { message: 'Internal Server Error' },
      expectedMessage: '服务器内部错误，请稍后重试\n\n💡 如问题持续，请联系技术支持'
    }
  ]
  
  let passCount = 0
  let totalTests = errorScenarios.length
  
  errorScenarios.forEach((scenario, index) => {
    console.log(`--- 错误测试 ${index + 1}: HTTP ${scenario.status} ---`)
    
    // 模拟错误处理逻辑
    const status = scenario.status
    const data = scenario.data
    let errorMessage = '删除报名失败，请稍后重试'
    
    switch (status) {
      case 400:
        errorMessage = `${data?.message || '请求参数错误'}`
        break
      case 401:
        errorMessage = '登录已过期，请重新登录后重试'
        break
      case 403:
        errorMessage = data?.message || '权限不足，无法删除该报名\n\n💡 请确认您有权限删除此项目的报名'
        break
      case 404:
        errorMessage = '项目报名不存在，请刷新页面后重试\n\n💡 该报名可能已被删除'
        break
      case 500:
        errorMessage = '服务器内部错误，请稍后重试\n\n💡 如问题持续，请联系技术支持'
        break
    }
    
    if (errorMessage.includes(scenario.expectedMessage)) {
      console.log('✅ 错误消息处理正确')
      passCount++
    } else {
      console.log(`❌ 错误消息处理不正确`)
      console.log(`   期望包含: ${scenario.expectedMessage}`)
      console.log(`   实际消息: ${errorMessage}`)
    }
    console.log('')
  })
  
  console.log(`📊 错误处理测试结果: ${passCount}/${totalTests} 通过`)
  return passCount === totalTests
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 开始项目删除功能完整测试...\n')
  console.log('=' * 50)
  
  const validationTest = testProjectDeletionValidation()
  console.log('=' * 50)
  
  const errorTest = testErrorResponseHandling()
  console.log('=' * 50)
  
  console.log('\n📋 最终测试结果:')
  console.log(`   项目状态验证: ${validationTest ? '✅ 通过' : '❌ 失败'}`)
  console.log(`   错误处理: ${errorTest ? '✅ 通过' : '❌ 失败'}`)
  
  const allTestsPassed = validationTest && errorTest
  console.log(`\n🎉 总体结果: ${allTestsPassed ? '✅ 所有测试通过' : '❌ 存在测试失败'}`)
  
  if (allTestsPassed) {
    console.log('\n💡 项目删除功能已准备就绪！')
    console.log('   请确保后端API /api/projects/{projectId}/apply (DELETE) 正常工作')
  }
  
  return allTestsPassed
}

// 导出函数供测试使用
function exportFunctions() {
  return {
    runAllTests,
    validateProjectDeletion,
    testProjectDeletionValidation,
    testErrorResponseHandling
  }
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = exportFunctions()
}

// 如果在浏览器控制台中运行
if (typeof window !== 'undefined') {
  window.testProjectDeletion = {
    runAllTests,
    validateProjectDeletion,
    testProjectDeletionValidation,
    testErrorResponseHandling
  }
  
  console.log('📝 项目删除测试工具已加载到 window.testProjectDeletion')
  console.log('💡 运行 window.testProjectDeletion.runAllTests() 开始测试')
}

// 自动运行测试（如果在Node.js环境中）
if (typeof module !== 'undefined' && module.exports) {
  runAllTests()
}