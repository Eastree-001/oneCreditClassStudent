// Token调试工具
export const tokenDebugger = {
  // 检查当前token状态
  checkTokenStatus() {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    
    console.log('🔍 Token状态检查:')
    console.log('- Token:', token ? `${token.substring(0, 20)}...` : '无')
    console.log('- Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : '无')
    console.log('- IsAuthenticated:', isAuthenticated)
    
    return {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      isAuthenticated: isAuthenticated === 'true'
    }
  },
  
  // 清除所有认证信息
  clearAuth() {
    console.log('🗑️ 清除所有认证信息')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userInfo')
  },
  
  // 设置测试token
  setTestToken() {
    const testToken = 'test-token-' + Date.now()
    const testRefreshToken = 'test-refresh-token-' + Date.now()
    
    localStorage.setItem('token', testToken)
    localStorage.setItem('refreshToken', testRefreshToken)
    localStorage.setItem('isAuthenticated', 'true')
    
    console.log('🧪 设置测试token完成')
    this.checkTokenStatus()
  }
}

// 在开发环境中暴露到全局
if (process.env.NODE_ENV === 'development') {
  window.tokenDebugger = tokenDebugger
  console.log('🔧 Token调试工具已加载，使用 tokenDebugger.checkTokenStatus() 检查状态')
}