// Token管理工具
import request from './request'

export const tokenManager = {
  // 验证当前token是否有效
  async validateToken() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('❌ 没有token')
        return false
      }
      
      console.log('🔍 验证token有效性...')
      
      // 尝试调用需要认证的API来验证token
      const response = await request.get('/auth/me')
      console.log('✅ Token验证成功:', response)
      return true
    } catch (error) {
      console.warn('❌ Token验证失败:', error.message)
      
      if (error.response?.status === 401) {
        console.log('🔄 Token已过期，尝试刷新...')
        return await this.refreshToken()
      }
      return false
    }
  },
  
  // 刷新token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        console.log('❌ 没有refresh token')
        return false
      }
      
      console.log('🔄 刷新token中...')
      
      const response = await request.post('/auth/refresh-token', {
        refreshToken
      })
      
      if (response && response.token) {
        localStorage.setItem('token', response.token)
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken)
        }
        console.log('✅ Token刷新成功')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Token刷新失败:', error)
      this.clearTokens()
      return false
    }
  },
  
  // 清除所有token
  clearTokens() {
    console.log('🗑️ 清除所有tokens')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('isAuthenticated')
  },
  
  // 获取当前token
  getToken() {
    return localStorage.getItem('token')
  },
  
  // 设置token
  setToken(token, refreshToken = null) {
    if (token) {
      localStorage.setItem('token', token)
      console.log('✅ Token已设置')
    }
    
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
      console.log('✅ RefreshToken已设置')
    }
    
    localStorage.setItem('isAuthenticated', 'true')
  },
  
  // 检查是否已认证
  isAuthenticated() {
    return !!localStorage.getItem('token') && localStorage.getItem('isAuthenticated') === 'true'
  }
}