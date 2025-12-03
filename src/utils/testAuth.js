// 认证测试工具
import { userApi, courseApi } from '@/api'
import { tokenManager } from './tokenManager'

export const authTest = {
  // 测试完整的认证流程
  async testAuthFlow(credentials = { username: 'test', password: 'test' }) {
    console.log('🧪 开始测试认证流程...')
    
    try {
      // 1. 测试登录
      console.log('1️⃣ 测试用户登录...')
      const loginResponse = await userApi.login(credentials)
      console.log('✅ 登录成功:', loginResponse)
      
      // 2. 验证token
      console.log('2️⃣ 验证token有效性...')
      const isTokenValid = await tokenManager.validateToken()
      console.log(isTokenValid ? '✅ Token有效' : '❌ Token无效')
      
      // 3. 测试推荐课程API
      console.log('3️⃣ 测试推荐课程API...')
      const recommendedCourses = await userApi.getRecommendedCourses()
      console.log('✅ 推荐课程API调用成功:', recommendedCourses)
      
      // 4. 测试课程详情API
      console.log('4️⃣ 测试课程详情API...')
      const courseDetail = await courseApi.getCourseDetail(1)
      console.log('✅ 课程详情API调用成功:', courseDetail)
      
      // 5. 测试课程评价API
      console.log('5️⃣ 测试课程评价API...')
      const courseReviews = await courseApi.getCourseReviews(1)
      console.log('✅ 课程评价API调用成功:', courseReviews)
      
      // 6. 测试选课API
      console.log('6️⃣ 测试选课API...')
      try {
        const selectResponse = await courseApi.selectCourse(1)
        console.log('✅ 选课API调用成功:', selectResponse)
      } catch (selectError) {
        console.log('⚠️ 选课API可能需要更完整的课程状态:', selectError.message)
      }
      
      // 7. 测试删除选课API
      console.log('7️⃣ 测试删除选课API...')
      try {
        const unselectResponse = await courseApi.unselectCourse(1)
        console.log('✅ 删除选课API调用成功:', unselectResponse)
      } catch (unselectError) {
        console.log('⚠️ 删除选课API可能需要先选课:', unselectError.message)
      }
      
      // 8. 测试其他需要认证的API
      console.log('8️⃣ 测试用户信息API...')
      const userInfo = await userApi.getUserInfo()
      console.log('✅ 用户信息API调用成功:', userInfo)
      
      console.log('🎉 认证流程测试完成')
      return {
        success: true,
        loginResponse,
        tokenValid: isTokenValid,
        recommendedCourses,
        courseDetail,
        courseReviews,
        userInfo
      }
    } catch (error) {
      console.error('❌ 认证流程测试失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // 测试推荐课程API的认证需求
  async testRecommendedCoursesAuth() {
    console.log('🔍 测试推荐课程API认证需求...')
    
    const originalToken = tokenManager.getToken()
    
    try {
      // 1. 清除token，测试无认证状态
      console.log('1️⃣ 测试无token状态...')
      tokenManager.clearTokens()
      
      try {
        await userApi.getRecommendedCourses()
        console.log('⚠️ 推荐课程API在无token状态下意外成功')
      } catch (error) {
        console.log('✅ 推荐课程API正确拒绝无token请求:', error.message)
      }
      
      // 2. 恢复token，测试认证状态
      console.log('2️⃣ 恢复token并测试认证状态...')
      if (originalToken) {
        tokenManager.setToken(originalToken)
        const recommendedCourses = await userApi.getRecommendedCourses()
        console.log('✅ 推荐课程API在有token状态下正常工作:', recommendedCourses)
      }
      
      return true
    } catch (error) {
      console.error('❌ 推荐课程API认证测试失败:', error)
      return false
    }
  },
  
  // 显示当前认证状态
  showAuthStatus() {
    const token = tokenManager.getToken()
    const isAuth = tokenManager.isAuthenticated()
    
    console.log('📋 当前认证状态:')
    console.log('- 认证状态:', isAuth ? '已认证' : '未认证')
    console.log('- Token存在:', !!token)
    console.log('- Token预览:', token ? token.substring(0, 20) + '...' : '无')
    
    return {
      isAuthenticated: isAuth,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    }
  }
}