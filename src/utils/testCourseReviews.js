// 课程评价测试工具
import { courseApi } from '@/api'
import { tokenManager } from './tokenManager'

export const courseReviewsTest = {
  // 测试课程评价获取流程
  async testCourseReviewsFlow(courseId = 1) {
    console.log('🧪 开始测试课程评价获取流程...')
    
    try {
      // 1. 检查用户认证状态
      console.log('1️⃣ 检查用户认证状态...')
      const isAuth = tokenManager.isAuthenticated()
      if (!isAuth) {
        console.warn('⚠️ 用户未登录，无法测试课程评价')
        return { success: false, error: '用户未认证' }
      }
      console.log('✅ 用户认证状态正常')
      
      // 2. 获取课程详情
      console.log('2️⃣ 获取课程详情...')
      const courseDetail = await courseApi.getCourseDetail(courseId)
      console.log('✅ 课程详情获取成功:', courseDetail)
      
      // 3. 获取课程评价列表
      console.log('3️⃣ 获取课程评价列表...')
      const reviewsResponse = await courseApi.getCourseReviews(courseId)
      console.log('✅ 课程评价获取成功:', reviewsResponse)
      
      // 4. 分析评价数据
      let reviews = []
      if (Array.isArray(reviewsResponse)) {
        reviews = reviewsResponse
      } else if (reviewsResponse && reviewsResponse.data) {
        reviews = reviewsResponse.data
      } else if (reviewsResponse && reviewsResponse.list) {
        reviews = reviewsResponse.list
      }
      
      console.log('📊 评价数据分析:')
      console.log(`  评价数量: ${reviews.length}`)
      console.log(`  数据格式: ${Array.isArray(reviewsResponse) ? '直接数组' : '包装对象'}`)
      
      // 5. 评价内容验证
      if (reviews.length > 0) {
        console.log('📝 评价内容示例:')
        reviews.slice(0, 2).forEach((review, index) => {
          console.log(`  评价${index + 1}:`, {
            id: review.id,
            name: review.name,
            rating: review.rating,
            date: review.date,
            hasContent: !!review.content
          })
        })
      }
      
      console.log('🎉 课程评价获取流程测试成功！')
      return {
        success: true,
        courseDetail,
        reviews,
        reviewsCount: reviews.length,
        courseId
      }
      
    } catch (error) {
      console.error('❌ 测试课程评价流程失败:', error)
      return {
        success: false,
        error: error.message,
        courseId
      }
    }
  },
  
  // 测试课程评价API的认证需求
  async testCourseReviewsAuth(courseId = 1) {
    console.log('🔍 测试课程评价API认证需求...')
    
    const originalToken = tokenManager.getToken()
    
    try {
      // 1. 清除token，测试无认证状态
      console.log('1️⃣ 测试无token状态...')
      tokenManager.clearTokens()
      
      try {
        await courseApi.getCourseReviews(courseId)
        console.log('⚠️ 课程评价API在无token状态下意外成功')
      } catch (error) {
        console.log('✅ 课程评价API正确拒绝无token请求:', error.message)
      }
      
      // 2. 恢复token，测试认证状态
      console.log('2️⃣ 恢复token并测试认证状态...')
      if (originalToken) {
        tokenManager.setToken(originalToken)
        const reviews = await courseApi.getCourseReviews(courseId)
        console.log('✅ 课程评价API在有token状态下正常工作:', reviews.length, '条评价')
      }
      
      return true
    } catch (error) {
      console.error('❌ 课程评价API认证测试失败:', error)
      return false
    }
  },
  
  // 测试多个课程的评价数据
  async testMultipleCoursesReviews(courseIds = [1, 2, 3]) {
    console.log('📚 测试多个课程的评价数据...')
    
    try {
      const results = []
      
      for (const courseId of courseIds) {
        console.log(`\n🔍 测试课程 ${courseId} 的评价数据...`)
        
        try {
          const reviewsResponse = await courseApi.getCourseReviews(courseId)
          let reviews = []
          
          if (Array.isArray(reviewsResponse)) {
            reviews = reviewsResponse
          } else if (reviewsResponse && reviewsResponse.data) {
            reviews = reviewsResponse.data
          } else if (reviewsResponse && reviewsResponse.list) {
            reviews = reviewsResponse.list
          }
          
          results.push({
            courseId,
            success: true,
            reviewsCount: reviews.length,
            hasData: reviews.length > 0
          })
          
          console.log(`✅ 课程 ${courseId}: ${reviews.length} 条评价`)
        } catch (error) {
          results.push({
            courseId,
            success: false,
            error: error.message
          })
          console.log(`❌ 课程 ${courseId}: 获取失败 - ${error.message}`)
        }
      }
      
      // 统计结果
      const successCount = results.filter(r => r.success).length
      const dataCount = results.filter(r => r.hasData).length
      
      console.log('\n📊 多课程评价测试统计:')
      console.log(`  成功获取: ${successCount}/${courseIds.length}`)
      console.log(`  有评价数据: ${dataCount}/${courseIds.length}`)
      
      return {
        success: true,
        results,
        summary: {
          total: courseIds.length,
          successCount,
          dataCount
        }
      }
      
    } catch (error) {
      console.error('❌ 多课程评价测试失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // 生成评价数据报告
  generateReviewsReport(reviews) {
    console.log('📋 生成评价数据报告...')
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {},
        latestReview: null
      }
    }
    
    // 计算平均评分
    const validRatings = reviews.filter(r => r.rating && typeof r.rating === 'number')
    const averageRating = validRatings.length > 0 
      ? validRatings.reduce((sum, r) => sum + r.rating, 0) / validRatings.length 
      : 0
    
    // 评分分布
    const ratingDistribution = {}
    validRatings.forEach(review => {
      const rating = review.rating
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1
    })
    
    // 最新评价
    const latestReview = reviews.sort((a, b) => {
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })[0]
    
    const report = {
      totalReviews: reviews.length,
      averageRating: averageRating.toFixed(2),
      ratingDistribution,
      latestReview: latestReview ? {
        name: latestReview.name,
        rating: latestReview.rating,
        date: latestReview.date,
        contentPreview: latestReview.content?.substring(0, 50) + '...'
      } : null
    }
    
    console.log('📊 评价数据报告:')
    console.log(`  总评价数: ${report.totalReviews}`)
    console.log(`  平均评分: ${report.averageRating}`)
    console.log(`  评分分布:`, report.ratingDistribution)
    if (report.latestReview) {
      console.log(`  最新评价: ${report.latestReview.name} - ${report.latestReview.rating}星`)
    }
    
    return report
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  console.log('🧪 课程评价测试工具已加载')
}