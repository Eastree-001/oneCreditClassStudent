// 测试学习进度课程API
import { userApi } from '../api/user.js'

const testProgressCourses = async () => {
  console.log('🧪 测试学习进度课程API...')
  
  try {
    console.log('📡 调用API: /progress/courses')
    const response = await userApi.getProgressCourses()
    console.log('📝 API响应:', response)
    
    // 检查响应数据
    if (response && typeof response === 'object') {
      if ('code' in response) {
        console.log(`✅ 标准格式响应 - code: ${response.code}, message: ${response.message || '无消息'}`)
        
        const successCodes = [200, 0, 201, 204]
        if (successCodes.includes(response.code)) {
          const data = response.data || response
          console.log(`✅ 成功获取课程数据，数量: ${Array.isArray(data) ? data.length : '非数组'}`)
          if (Array.isArray(data) && data.length > 0) {
            console.log('📋 前几个课程:', data.slice(0, 3))
          }
        } else {
          console.log('❌ API返回错误状态')
        }
      } else {
        console.log('📄 非标准格式响应')
        console.log(`✅ 直接数据，数量: ${Array.isArray(response) ? response.length : '非数组'}`)
        if (Array.isArray(response) && response.length > 0) {
          console.log('📋 前几个课程:', response.slice(0, 3))
        }
      }
    } else {
      console.log('❌ 响应数据格式异常:', typeof response)
    }
  } catch (error) {
    console.error('❌ API调用失败:', error.message)
    if (error.response) {
      console.error('错误状态:', error.response.status)
      console.error('错误数据:', error.response.data)
    }
  }
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  testProgressCourses().then(() => {
    console.log('🏁 测试完成')
    process.exit(0)
  }).catch(error => {
    console.error('💥 测试失败:', error)
    process.exit(1)
  })
}

export { testProgressCourses }