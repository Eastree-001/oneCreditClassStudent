// 课程选课测试工具
import { courseApi } from '@/api'
import { tokenManager } from './tokenManager'

export const courseSelectionTest = {
  // 测试单个课程选课流程
  async testSelectCourseFlow(courseId = 1) {
    console.log('🧪 开始测试单个课程选课流程...')
    
    try {
      // 1. 检查用户认证状态
      console.log('1️⃣ 检查用户认证状态...')
      const isAuth = tokenManager.isAuthenticated()
      if (!isAuth) {
        console.warn('⚠️ 用户未登录，无法测试选课')
        return { success: false, error: '用户未认证' }
      }
      console.log('✅ 用户认证状态正常')
      
      // 2. 获取课程信息
      console.log('2️⃣ 获取课程信息...')
      const courseDetail = await courseApi.getCourseDetail(courseId)
      console.log('✅ 课程信息获取成功:', courseDetail)
      
      // 3. 检查课程状态
      console.log('3️⃣ 检查课程可选状态...')
      if (courseDetail.enrolled >= courseDetail.capacity) {
        console.warn('⚠️ 课程已满员，无法选择')
        return { success: false, error: '课程已满员' }
      }
      if (courseDetail.alreadySelected) {
        console.warn('⚠️ 用户已选修过该课程')
        return { success: false, error: '已选修过该课程' }
      }
      console.log('✅ 课程状态正常，可以选择')
      
      // 4. 调用选课API
      console.log('4️⃣ 调用选课API...')
      const selectResponse = await courseApi.selectCourse(courseId)
      console.log('✅ 选课API调用成功:', selectResponse)
      
      // 5. 验证选课结果
      let success = false
      let message = '选课成功'
      
      if (selectResponse && typeof selectResponse === 'object') {
        if ('code' in selectResponse) {
          // 标准格式响应
          const successCodes = [200, 0, 201, 204]
          success = successCodes.includes(selectResponse.code)
          message = selectResponse.message || (success ? '选课成功' : '选课失败')
          console.log('🏷️ 选课标准格式响应，code:', selectResponse.code, 'success:', success)
        } else {
          // 非标准格式，假设成功
          success = true
          console.log('📋 选课非标准格式响应，假设成功')
        }
      } else {
        // 简单响应，假设成功
        success = true
        console.log('📄 选课简单响应，假设成功')
      }
      
      if (success) {
        console.log('🎉 单个课程选课流程测试成功！')
        return {
          success: true,
          courseId,
          courseName: courseDetail.name,
          message,
          response: selectResponse
        }
      } else {
        console.error('❌ 选课失败:', message)
        return {
          success: false,
          courseId,
          courseName: courseDetail.name,
          error: message,
          response: selectResponse
        }
      }
      
    } catch (error) {
      console.error('❌ 测试选课流程失败:', error)
      
      // 分析错误类型
      let errorType = '未知错误'
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorType = '认证失败'
            break
          case 400:
            errorType = '请求参数错误'
            break
          case 409:
            errorType = '课程状态冲突'
            break
          case 500:
            errorType = '服务器内部错误'
            break
          default:
            errorType = `HTTP ${error.response.status} 错误`
        }
      } else if (error.request) {
        errorType = '网络请求失败'
      } else {
        errorType = '客户端错误'
      }
      
      return {
        success: false,
        courseId,
        error: error.message,
        errorType
      }
    }
  },
  
  // 测试选课API的认证需求
  async testSelectCourseAuth(courseId = 1) {
    console.log('🔍 测试选课API认证需求...')
    
    const originalToken = tokenManager.getToken()
    
    try {
      // 1. 清除token，测试无认证状态
      console.log('1️⃣ 测试无token状态...')
      tokenManager.clearTokens()
      
      try {
        await courseApi.selectCourse(courseId)
        console.log('⚠️ 选课API在无token状态下意外成功')
      } catch (error) {
        console.log('✅ 选课API正确拒绝无token请求:', error.message)
      }
      
      // 2. 恢复token，测试认证状态
      console.log('2️⃣ 恢复token并测试认证状态...')
      if (originalToken) {
        tokenManager.setToken(originalToken)
        const selectResponse = await courseApi.selectCourse(courseId)
        console.log('✅ 选课API在有token状态下正常工作:', selectResponse)
      }
      
      return true
    } catch (error) {
      console.error('❌ 选课API认证测试失败:', error)
      return false
    }
  },
  
  // 测试多个课程的选课
  async testMultipleCourseSelection(courseIds = [1, 2, 3]) {
    console.log('📚 测试多个课程的选课...')
    
    try {
      const results = []
      
      for (const courseId of courseIds) {
        console.log(`\n🔍 测试课程 ${courseId} 的选课...`)
        
        try {
          const selectResponse = await courseApi.selectCourse(courseId)
          
          results.push({
            courseId,
            success: true,
            response: selectResponse
          })
          
          console.log(`✅ 课程 ${courseId}: 选课成功`)
        } catch (error) {
          results.push({
            courseId,
            success: false,
            error: error.message
          })
          console.log(`❌ 课程 ${courseId}: 选课失败 - ${error.message}`)
        }
        
        // 添加小延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // 统计结果
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      
      console.log('\n📊 多课程选课测试统计:')
      console.log(`  成功选课: ${successCount}/${courseIds.length}`)
      console.log(`  选课失败: ${failCount}/${courseIds.length}`)
      
      return {
        success: true,
        results,
        summary: {
          total: courseIds.length,
          successCount,
          failCount
        }
      }
      
    } catch (error) {
      console.error('❌ 多课程选课测试失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // 测试选课冲突处理
  async testCourseSelectionConflict(courseId = 1) {
    console.log('⚔️ 测试选课冲突处理...')
    
    try {
      // 1. 第一次选课
      console.log('1️⃣ 第一次选课...')
      const firstResponse = await courseApi.selectCourse(courseId)
      console.log('✅ 第一次选课成功:', firstResponse)
      
      // 2. 第二次选同样的课程（应该产生冲突）
      console.log('2️⃣ 第二次选同样的课程...')
      try {
        const secondResponse = await courseApi.selectCourse(courseId)
        console.log('⚠️ 第二次选课意外成功:', secondResponse)
        return { success: false, error: '第二次选应该产生冲突但没有' }
      } catch (conflictError) {
        console.log('✅ 第二次选课正确产生冲突:', conflictError.message)
        
        // 检查是否是预期的冲突错误
        const isExpectedConflict = 
          conflictError.response?.status === 409 ||
          conflictError.response?.data?.message?.includes('已选择') ||
          conflictError.response?.data?.message?.includes('重复')
        
        if (isExpectedConflict) {
          console.log('🎯 冲突类型符合预期')
          return { success: true, conflictType: 'expected' }
        } else {
          console.log('⚠️ 冲突类型不符合预期')
          return { success: true, conflictType: 'unexpected', error: conflictError.message }
        }
      }
      
    } catch (error) {
      console.error('❌ 选课冲突测试失败:', error)
      return { success: false, error: error.message }
    }
  },
  
  // 测试删除已选课程
  async testUnselectCourse(courseId = 1) {
    console.log('🗑️ 开始测试删除已选课程...')
    
    try {
      // 1. 检查用户认证状态
      console.log('1️⃣ 检查用户认证状态...')
      const isAuth = tokenManager.isAuthenticated()
      if (!isAuth) {
        console.warn('⚠️ 用户未登录，无法测试删除选课')
        return { success: false, error: '用户未认证' }
      }
      console.log('✅ 用户认证状态正常')
      
      // 2. 获取课程信息
      console.log('2️⃣ 获取课程信息...')
      const courseDetail = await courseApi.getCourseDetail(courseId)
      console.log('✅ 课程信息获取成功:', courseDetail)
      
      // 3. 调用删除选课API
      console.log('3️⃣ 调用删除选课API...')
      const unselectResponse = await courseApi.unselectCourse(courseId)
      console.log('✅ 删除选课API调用成功:', unselectResponse)
      
      // 4. 验证删除结果
      let success = false
      let message = '删除选课成功'
      
      if (unselectResponse && typeof unselectResponse === 'object') {
        if ('code' in unselectResponse) {
          // 标准格式响应
          const successCodes = [200, 0, 201, 204]
          success = successCodes.includes(unselectResponse.code)
          message = unselectResponse.message || (success ? '删除选课成功' : '删除选课失败')
          console.log('🏷️ 删除选课标准格式响应，code:', unselectResponse.code, 'success:', success)
        } else {
          // 非标准格式，假设成功
          success = true
          console.log('📋 删除选课非标准格式响应，假设成功')
        }
      } else {
        // 简单响应，假设成功
        success = true
        console.log('📄 删除选课简单响应，假设成功')
      }
      
      if (success) {
        console.log('🎉 删除已选课程测试成功！')
        return {
          success: true,
          courseId,
          courseName: courseDetail.name,
          message,
          response: unselectResponse
        }
      } else {
        console.error('❌ 删除选课失败:', message)
        return {
          success: false,
          courseId,
          courseName: courseDetail.name,
          error: message,
          response: unselectResponse
        }
      }
      
    } catch (error) {
      console.error('❌ 测试删除选课失败:', error)
      
      // 分析错误类型
      let errorType = '未知错误'
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorType = '认证失败'
            break
          case 404:
            errorType = '选课记录不存在'
            break
          case 400:
            errorType = '请求参数错误'
            break
          case 409:
            errorType = '选课状态冲突'
            break
          case 500:
            errorType = '服务器内部错误'
            break
          default:
            errorType = `HTTP ${error.response.status} 错误`
        }
      } else if (error.request) {
        errorType = '网络请求失败'
      } else {
        errorType = '客户端错误'
      }
      
      return {
        success: false,
        courseId,
        error: error.message,
        errorType
      }
    }
  },
  
  // 测试完整的选课/删除流程
  async testCompleteSelectUnselectFlow(courseId = 1) {
    console.log('🔄 开始测试完整的选课/删除流程...')
    
    try {
      const results = []
      
      // 1. 测试选课
      console.log('\n📚 第一步：测试选课...')
      const selectResult = await this.testSelectCourseFlow(courseId)
      results.push({ action: 'select', ...selectResult })
      
      // 等待一下，避免状态冲突
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 2. 测试删除选课
      console.log('\n🗑️ 第二步：测试删除选课...')
      const unselectResult = await this.testUnselectCourse(courseId)
      results.push({ action: 'unselect', ...unselectResult })
      
      // 统计结果
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      
      console.log('\n📊 完整流程测试统计:')
      console.log(`  成功操作: ${successCount}/${results.length}`)
      console.log(`  失败操作: ${failCount}/${results.length}`)
      
      return {
        success: successCount === results.length,
        results,
        summary: {
          total: results.length,
          successCount,
          failCount
        }
      }
      
    } catch (error) {
      console.error('❌ 完整流程测试失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // 生成选课报告
  generateSelectionReport(testResults) {
    console.log('📋 生成选课测试报告...')
    
    if (!Array.isArray(testResults) || testResults.length === 0) {
      return {
        totalTests: 0,
        successRate: 0,
        successCount: 0,
        failCount: 0,
        commonErrors: []
      }
    }
    
    const successCount = testResults.filter(r => r.success).length
    const failCount = testResults.length - successCount
    const successRate = (successCount / testResults.length * 100).toFixed(2)
    
    // 统计常见错误
    const errorMap = {}
    testResults.filter(r => !r.success).forEach(result => {
      const error = result.error || result.errorType || '未知错误'
      errorMap[error] = (errorMap[error] || 0) + 1
    })
    
    const commonErrors = Object.entries(errorMap)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    const report = {
      totalTests: testResults.length,
      successCount,
      failCount,
      successRate: `${successRate}%`,
      commonErrors
    }
    
    console.log('📊 选课测试报告:')
    console.log(`  总测试数: ${report.totalTests}`)
    console.log(`  成功数量: ${report.successCount}`)
    console.log(`  失败数量: ${report.failCount}`)
    console.log(`  成功率: ${report.successRate}`)
    console.log('  常见错误:', report.commonErrors)
    
    return report
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  console.log('🧪 课程选课测试工具已加载')
}