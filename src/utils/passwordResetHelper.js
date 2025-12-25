// 密码重置后登录辅助工具
export const passwordResetHelper = {
  // 检查是否为密码重置后首次登录
  isPasswordResetLogin() {
    return localStorage.getItem('isPasswordReset') === 'true'
  },

  // 标记密码重置状态
  markPasswordReset() {
    localStorage.setItem('isPasswordReset', 'true')
    console.log('🔄 已标记为密码重置状态')
  },

  // 清除密码重置标记
  clearPasswordResetMark() {
    localStorage.removeItem('isPasswordReset')
    console.log('🧹 已清除密码重置标记')
  },

  // 强制重新认证（用于密码重置后）
  async forceReauth() {
    console.group('🔄 密码重置后强制重新认证')
    
    try {
      // 清除所有旧的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isAuthenticated')
      console.log('🗑️ 已清除旧认证信息')
      
      // 重新设置认证状态标记
      localStorage.setItem('isAuthenticated', 'true')
      console.log('✅ 已重新设置认证状态')
      
      return true
    } catch (error) {
      console.error('❌ 强制重新认证失败:', error)
      return false
    } finally {
      console.groupEnd()
    }
  },

  // 验证密码重置后的API调用
  async testApisAfterReset() {
    console.group('🧪 测试密码重置后的API可用性')
    
    const testResults = []
    
    try {
      // 测试1: 用户信息API
      console.log('测试1: /auth/me')
      const { userApi } = await import('@/api/user.js')
      const userInfo = await userApi.getAuthUserInfo()
      testResults.push({ api: '/auth/me', status: '✅ 成功', data: userInfo })
    } catch (error) {
      testResults.push({ api: '/auth/me', status: '❌ 失败', error: error.message })
    }
    
    try {
      // 测试2: 推荐课程API
      console.log('测试2: /courses/recommended')
      const { userApi } = await import('@/api/user.js')
      const courses = await userApi.getRecommendedCourses()
      testResults.push({ api: '/courses/recommended', status: '✅ 成功', data: courses })
    } catch (error) {
      testResults.push({ api: '/courses/recommended', status: '❌ 失败', error: error.message })
    }
    
    try {
      // 测试3: 用户统计API
      console.log('测试3: /user/stats')
      const { userApi } = await import('@/api/user.js')
      const stats = await userApi.getStats()
      testResults.push({ api: '/user/stats', status: '✅ 成功', data: stats })
    } catch (error) {
      testResults.push({ api: '/user/stats', status: '❌ 失败', error: error.message })
    }
    
    console.log('📊 API测试结果:', testResults)
    console.groupEnd()
    
    return testResults
  },

  // 生成诊断报告
  generateDiagnosticReport() {
    const report = {
      timestamp: new Date().toISOString(),
      isPasswordReset: this.isPasswordResetLogin(),
      localStorage: {
        hasToken: !!localStorage.getItem('token'),
        hasRefreshToken: !!localStorage.getItem('refreshToken'),
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        tokenPreview: localStorage.getItem('token') ? 
          localStorage.getItem('token').substring(0, 20) + '...' : '无'
      },
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    }
    
    console.log('📋 密码重置诊断报告:', report)
    return report
  }
}

// 在开发环境中暴露到全局
if (process.env.NODE_ENV === 'development') {
  window.passwordResetHelper = passwordResetHelper
  console.log('🔧 密码重置辅助工具已加载')
  console.log('使用方法:')
  console.log('- passwordResetHelper.isPasswordResetLogin()')
  console.log('- passwordResetHelper.testApisAfterReset()')
  console.log('- passwordResetHelper.generateDiagnosticReport()')
  console.log('- passwordResetHelper.forceReauth()')
}