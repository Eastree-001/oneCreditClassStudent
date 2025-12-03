// 测试项目取消报名功能
import { projectApi } from '../api/project.js'

async function testCancelApplication() {
  console.log('🧪 开始测试项目取消报名功能...')
  
  try {
    // 测试项目ID（这里使用一个示例ID，实际测试时需要替换为真实的项目ID）
    const testProjectId = 1
    
    console.log(`📝 测试取消项目报名: 项目ID = ${testProjectId}`)
    
    // 调用取消报名API
    const response = await projectApi.cancelProjectApplication(testProjectId)
    
    console.log('✅ 取消报名成功!')
    console.log('📋 响应数据:', response)
    
    // 验证响应格式
    if (response && (response.code === 200 || response.code === 0)) {
      console.log('✅ API响应格式正确')
    } else {
      console.log('⚠️ API响应格式可能需要调整')
    }
    
  } catch (error) {
    console.error('❌ 取消报名测试失败:', error)
    
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
      console.error('错误消息:', error.response.data?.message)
    } else {
      console.error('网络错误或其他错误:', error.message)
    }
  }
  
  console.log('🏁 测试完成')
}

// 导出测试函数
export { testCancelApplication }

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中
  window.testCancelApplication = testCancelApplication
  console.log('💡 在浏览器控制台中运行 testCancelApplication() 来测试取消报名功能')
} else {
  // 在Node.js环境中
  testCancelApplication()
}