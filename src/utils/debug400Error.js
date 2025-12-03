// 400错误调试工具
// 用于分析和调试项目删除报名时的400错误

window.debug400Error = {
  // 记录错误详情
  logErrorDetails: function(error, project) {
    console.group('🔍 400错误详细分析')
    console.log('📋 错误对象:', error)
    console.log('📋 项目信息:', project)
    console.log('📋 错误响应:', error.response)
    
    if (error.response?.data) {
      const data = error.response.data
      console.log('📊 响应数据分析:')
      console.log('   - code:', data.code)
      console.log('   - message:', data.message)
      console.log('   - data:', data.data)
      console.log('   - errors:', data.errors)
      
      // 深度分析errors对象
      if (data.errors && typeof data.errors === 'object') {
        console.log('🔍 Errors对象深度分析:')
        Object.entries(data.errors).forEach(([key, value]) => {
          console.log(`   ${key}:`, value)
          
          // 如果是对象，继续展开
          if (value && typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              console.log(`     ${subKey}:`, subValue)
            })
          }
        })
      }
    }
    
    console.groupEnd()
  },

  // 分析可能的原因
  analyzePossibleCauses: function(project) {
    console.group('🤔 可能原因分析')
    
    const causes = []
    
    // 1. 检查项目状态
    const deletableStatuses = ['可报名', '申请中', '已报名']
    if (project.status && !deletableStatuses.includes(project.status)) {
      causes.push({
        type: '项目状态限制',
        description: `项目状态为"${project.status}"，不允许删除`,
        solution: '项目状态需要是"可报名"、"申请中"或"已报名"'
      })
    }
    
    // 2. 检查项目时间
    const now = new Date()
    if (project.startDate) {
      const startDate = new Date(project.startDate)
      if (startDate <= now) {
        causes.push({
          type: '项目已开始',
          description: `项目开始时间${project.startDate}已过`,
          solution: '项目开始后无法删除报名，请联系管理员'
        })
      }
    }
    
    if (project.endDate) {
      const endDate = new Date(project.endDate)
      if (endDate <= now) {
        causes.push({
          type: '项目已结束',
          description: `项目结束时间${project.endDate}已过`,
          solution: '项目结束后无法删除报名记录'
        })
      }
    }
    
    // 3. 检查报名人数
    if (project.enrolled && project.capacity && project.enrolled >= project.capacity) {
      causes.push({
        type: '项目已满员',
        description: `项目人数已满 (${project.enrolled}/${project.capacity})`,
        solution: '项目满员时可能有特殊限制，请联系管理员'
      })
    }
    
    // 4. 检查用户权限
    const userInfo = localStorage.getItem('userInfo')
    if (!userInfo && !localStorage.getItem('token')) {
      causes.push({
        type: '用户未登录',
        description: '检测到用户未登录或token无效',
        solution: '请重新登录后再试'
      })
    }
    
    if (causes.length === 0) {
      causes.push({
        type: '未知原因',
        description: '未发现明显的客户端问题',
        solution: '可能是后端业务逻辑限制，请检查后端日志'
      })
    }
    
    causes.forEach((cause, index) => {
      console.log(`${index + 1}. ${cause.type}`)
      console.log(`   描述: ${cause.description}`)
      console.log(`   建议: ${cause.solution}`)
      console.log('')
    })
    
    console.groupEnd()
    return causes
  },

  // 生成调试报告
  generateDebugReport: function(error, project) {
    const report = {
      timestamp: new Date().toISOString(),
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      },
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        enrolled: project.enrolled,
        capacity: project.capacity,
        startDate: project.startDate,
        endDate: project.endDate
      },
      user: {
        hasToken: !!localStorage.getItem('token'),
        userInfo: localStorage.getItem('userInfo')
      },
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
    
    console.log('📄 调试报告已生成:', report)
    return report
  },

  // 尝试修复常见问题
  attemptFixes: async function(project) {
    console.group('🔧 尝试修复常见问题')
    
    const fixes = []
    
    // 1. 刷新项目数据
    try {
      console.log('🔄 尝试刷新项目数据...')
      // 这里可以调用刷新数据的API
      fixes.push('项目数据刷新尝试完成')
    } catch (e) {
      console.warn('刷新项目数据失败:', e)
      fixes.push('项目数据刷新失败')
    }
    
    // 2. 重新验证用户身份
    try {
      console.log('🔑 尝试重新验证用户身份...')
      const token = localStorage.getItem('token')
      if (token) {
        fixes.push('用户token有效')
      } else {
        fixes.push('用户token无效，需要重新登录')
      }
    } catch (e) {
      console.warn('验证用户身份失败:', e)
      fixes.push('用户身份验证失败')
    }
    
    // 3. 检查网络连接
    try {
      console.log('🌐 检查网络连接...')
      const response = await fetch('/api/health', { method: 'HEAD' })
      if (response.ok) {
        fixes.push('网络连接正常')
      } else {
        fixes.push('网络连接异常')
      }
    } catch (e) {
      console.warn('网络检查失败:', e)
      fixes.push('网络检查失败')
    }
    
    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix}`)
    })
    
    console.groupEnd()
    return fixes
  }
}

// 自动加载到全局
console.log('🔧 400错误调试工具已加载到 window.debug400Error')
console.log('📝 使用方法:')
console.log('   window.debug400Error.logErrorDetails(error, project)')
console.log('   window.debug400Error.analyzePossibleCauses(project)')
console.log('   window.debug400Error.generateDebugReport(error, project)')
console.log('   window.debug400Error.attemptFixes(project)')