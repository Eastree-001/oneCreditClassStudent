// 测试后端教师数据获取功能
import { fetchCourseTeacherFromBackend, enrichRecommendedCoursesWithTeacherData } from './teacherDataBackend.js'

const testTeacherDataBackend = async () => {
  console.log('🧪 测试后端教师数据获取功能...')
  
  // 测试数据：模拟推荐课程返回的数据（教师字段未定义）
  const testRecommendedCourses = [
    {
      id: 1,
      name: 'Vue.js 3 企业级开发实战',
      enterprise: '腾讯科技',
      category: '前端开发',
      teacher: undefined, // 教师字段未定义
      recommendReason: '热门技术，就业前景好'
    },
    {
      id: 2,
      name: 'React 框架深入浅出',
      enterprise: '字节跳动',
      category: '前端开发',
      teacher: null, // 教师字段为null
      recommendReason: '大厂框架，实用性强'
    },
    {
      id: 3,
      name: 'Spring Boot 微服务架构',
      enterprise: '阿里云',
      category: '后端开发',
      teacher: '', // 教师字段为空字符串
      recommendReason: '企业级技术，市场需求大'
    }
  ]
  
  try {
    console.log('\n📚 测试课程列表:')
    testRecommendedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name} - 教师: ${course.teacher} (${typeof course.teacher})`)
    })
    
    // 1. 测试单个课程教师获取
    console.log('\n👨‍🏫 1️⃣ 测试单个课程教师获取...')
    const singleTeacher = await fetchCourseTeacherFromBackend(1)
    console.log('单个教师获取结果:', singleTeacher)
    
    // 2. 测试批量教师数据获取
    console.log('\n👥 2️⃣ 测试推荐课程教师数据丰富...')
    const enrichedCourses = await enrichRecommendedCoursesWithTeacherData(testRecommendedCourses)
    console.log('\n✨ 丰富后的课程数据:')
    enrichedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.name}`)
      console.log(`   教师: ${course.teacher}`)
      console.log(`   教师信息:`, course.teacherInfo)
      console.log(`   数据来源: ${course.teacherSource}`)
      console.log(`   数据有效: ${course.hasValidTeacher}`)
      console.log('')
    })
    
    // 3. 验证数据完整性
    console.log('📊 3️⃣ 数据完整性验证...')
    const validTeachers = enrichedCourses.filter(course => course.hasValidTeacher).length
    const totalCourses = enrichedCourses.length
    const successRate = (validTeachers / totalCourses * 100).toFixed(1)
    
    console.log(`总课程数: ${totalCourses}`)
    console.log(`有效教师数据: ${validTeachers}`)
    console.log(`成功率: ${successRate}%`)
    
    if (validTeachers === totalCourses) {
      console.log('✅ 所有课程都获取到了有效的教师数据')
    } else {
      console.log(`⚠️ 还有 ${totalCourses - validTeachers} 门课程的教师数据需要检查`)
    }
    
    // 4. 测试API端点
    console.log('\n🔗 4️⃣ 测试的API端点:')
    console.log('单个教师: GET /api/courses/{courseId}/teacher')
    console.log('批量教师: POST /api/courses/teachers')
    
    console.log('\n✅ 后端教师数据获取测试完成')
    
    return {
      success: true,
      totalCourses,
      validTeachers,
      successRate: parseFloat(successRate),
      enrichedCourses
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error('错误详情:', error)
    
    return {
      success: false,
      error: error.message
    }
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  testTeacherDataBackend().then(result => {
    console.log('\n🏁 测试完成，结果:', result)
    process.exit(0)
  }).catch(error => {
    console.error('💥 测试崩溃:', error)
    process.exit(1)
  })
}

export { testTeacherDataBackend }