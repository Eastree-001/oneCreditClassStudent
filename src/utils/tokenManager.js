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
      // 使用多个API进行验证，提高可靠性
      let response
      try {
        // 首先尝试获取用户信息
        response = await request.get('/auth/me')
      } catch (meError) {
        console.warn('🔍 /auth/me 验证失败，尝试其他API:', meError.message)
        try {
          // 备用方案：尝试用户统计API
          response = await request.get('/user/stats')
        } catch (statsError) {
          console.warn('🔍 /user/stats 验证失败，尝试推荐课程API:', statsError.message)
          try {
            // 最后尝试：推荐课程API
            response = await request.get('/courses/recommended')
          } catch (coursesError) {
            console.warn('🔍 所有API验证都失败:', coursesError.message)
            throw coursesError
          }
        }
      }
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