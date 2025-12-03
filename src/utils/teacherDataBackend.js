/**
 * 教师数据后端获取工具
 * 从后端数据库获取真实的课程指导教师信息
 */

import { courseApi } from '../api/course.js'

/**
 * 从后端数据库获取单个课程的教师信息
 * @param {number} courseId 课程ID
 * @returns {Promise<Object>} 教师信息对象
 */
export async function fetchCourseTeacherFromBackend(courseId) {
  try {
    console.log(`👨‍🏫 从后端获取课程 ${courseId} 的教师信息...`)
    
    const response = await courseApi.getCourseTeacher(courseId)
    console.log(`📝 课程 ${courseId} 教师响应:`, response)
    
    let teacherData = {
      name: '未知教师',
      title: '',
      department: '',
      email: '',
      isValid: false,
      source: 'backend'
    }
    
    // 处理不同的响应格式
    if (response && typeof response === 'object') {
      if (response.code === 200 || response.code === 0) {
        // 标准API响应格式
        const data = response.data || response
        teacherData = {
          name: data.teacher_name || data.name || data.teacher || '未知教师',
          title: data.title || data.position || '',
          department: data.department || data.faculty || '',
          email: data.email || '',
          avatar: data.avatar || '',
          bio: data.bio || data.description || '',
          isValid: !!(data.teacher_name || data.name || data.teacher),
          source: 'backend'
        }
      } else if (response.teacher_name || response.name || response.teacher) {
        // 直接返回教师数据
        teacherData = {
          name: response.teacher_name || response.name || response.teacher,
          title: response.title || response.position || '',
          department: response.department || response.faculty || '',
          email: response.email || '',
          avatar: response.avatar || '',
          bio: response.bio || response.description || '',
          isValid: true,
          source: 'backend'
        }
      }
    }
    
    console.log(`✅ 课程 ${courseId} 教师信息获取成功:`, teacherData.name)
    return teacherData
    
  } catch (error) {
    console.error(`❌ 获取课程 ${courseId} 教师信息失败:`, error.message)
    
    // 返回默认教师信息
    return {
      name: '未知教师',
      title: '',
      department: '',
      email: '',
      isValid: false,
      source: 'fallback',
      error: error.message
    }
  }
}

/**
 * 批量从后端数据库获取课程教师信息
 * @param {Array} courses 课程列表
 * @returns {Promise<Array>} 更新后的课程列表
 */
export async function fetchTeachersForCoursesFromBackend(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    console.log('⚠️ 课程列表为空，无需获取教师信息')
    return []
  }
  
  console.log(`👥 开始批量获取 ${courses.length} 门课程的教师信息...`)
  
  try {
    // 首先尝试批量获取
    const courseIds = courses.map(course => course.id).filter(id => id)
    
    if (courseIds.length === 0) {
      console.warn('⚠️ 没有有效的课程ID')
      return courses
    }
    
    console.log('📡 尝试批量获取教师信息...')
    const batchResponse = await courseApi.getBatchCourseTeachers(courseIds)
    console.log('📝 批量教师响应:', batchResponse)
    
    let teachersMap = {}
    
    // 处理批量响应
    if (batchResponse && typeof batchResponse === 'object') {
      if (batchResponse.code === 200 || batchResponse.code === 0) {
        const data = batchResponse.data || batchResponse
        if (Array.isArray(data)) {
          data.forEach(teacherInfo => {
            teachersMap[teacherInfo.course_id] = {
              name: teacherInfo.teacher_name || teacherInfo.name || teacherInfo.teacher || '未知教师',
              title: teacherInfo.title || teacherInfo.position || '',
              department: teacherInfo.department || teacherInfo.faculty || '',
              email: teacherInfo.email || '',
              avatar: teacherInfo.avatar || '',
              bio: teacherInfo.bio || teacherInfo.description || '',
              isValid: !!(teacherInfo.teacher_name || teacherInfo.name || teacherInfo.teacher),
              source: 'backend_batch'
            }
          })
        }
      }
    }
    
    // 更新课程列表
    const updatedCourses = courses.map(course => {
      const teacherInfo = teachersMap[course.id]
      
      if (teacherInfo) {
        console.log(`✅ 课程 "${course.name}" 批量获取教师成功: ${teacherInfo.name}`)
        return {
          ...course,
          teacher: teacherInfo.name,
          teacherInfo: teacherInfo,
          hasValidTeacher: teacherInfo.isValid,
          teacherSource: teacherInfo.source
        }
      } else {
        // 批量获取失败，尝试单个获取
        console.log(`⚠️ 课程 "${course.name}" 批量获取失败，尝试单个获取...`)
        return {
          ...course,
          teacherPending: true
        }
      }
    })
    
    // 对于批量获取失败的课程，进行单个获取
    const pendingCourses = updatedCourses.filter(course => course.teacherPending)
    if (pendingCourses.length > 0) {
      console.log(`🔄 有 ${pendingCourses.length} 门课程需要单独获取教师信息...`)
      
      for (let i = 0; i < pendingCourses.length; i++) {
        const course = pendingCourses[i]
        const teacherInfo = await fetchCourseTeacherFromBackend(course.id)
        
        // 在原列表中更新
        const courseIndex = updatedCourses.findIndex(c => c.id === course.id)
        if (courseIndex !== -1) {
          updatedCourses[courseIndex] = {
            ...updatedCourses[courseIndex],
            teacher: teacherInfo.name,
            teacherInfo: teacherInfo,
            hasValidTeacher: teacherInfo.isValid,
            teacherSource: teacherInfo.source,
            teacherPending: false
          }
        }
        
        // 添加延迟避免请求过于频繁
        if (i < pendingCourses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }
    
    // 统计结果
    const validTeacherCount = updatedCourses.filter(course => course.hasValidTeacher).length
    console.log(`\n📊 教师信息获取统计:`)
    console.log(`  总课程数: ${updatedCourses.length}`)
    console.log(`  成功获取教师: ${validTeacherCount}`)
    console.log(`  成功率: ${(validTeacherCount / updatedCourses.length * 100).toFixed(1)}%`)
    
    return updatedCourses
    
  } catch (error) {
    console.error('❌ 批量获取教师信息失败:', error.message)
    
    // 降级为逐个获取
    console.log('🔄 降级为逐个获取教师信息...')
    const updatedCourses = []
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i]
      console.log(`👨‍🏫 获取课程 ${i + 1}/${courses.length} 的教师信息...`)
      
      const teacherInfo = await fetchCourseTeacherFromBackend(course.id)
      
      updatedCourses.push({
        ...course,
        teacher: teacherInfo.name,
        teacherInfo: teacherInfo,
        hasValidTeacher: teacherInfo.isValid,
        teacherSource: teacherInfo.source
      })
      
      // 添加延迟
      if (i < courses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return updatedCourses
  }
}

/**
 * 为推荐课程获取真实的教师数据
 * @param {Array} recommendedCourses 推荐课程列表
 * @returns {Promise<Array>} 带有真实教师数据的推荐课程列表
 */
export async function enrichRecommendedCoursesWithTeacherData(recommendedCourses) {
  console.log('🎓 为推荐课程获取真实教师数据...')
  
  if (!Array.isArray(recommendedCourses) || recommendedCourses.length === 0) {
    console.log('⚠️ 推荐课程列表为空')
    return []
  }
  
  try {
    // 从后端数据库获取教师信息
    const enrichedCourses = await fetchTeachersForCoursesFromBackend(recommendedCourses)
    
    // 为每个课程添加数据来源信息
    const finalCourses = enrichedCourses.map(course => ({
      ...course,
      _teacherEnriched: true,
      _teacherEnrichmentTime: new Date().toISOString(),
      dataSource: 'backend_database'
    }))
    
    console.log('✅ 推荐课程教师数据丰富完成')
    return finalCourses
    
  } catch (error) {
    console.error('❌ 推荐课程教师数据丰富失败:', error.message)
    
    // 如果后端获取失败，使用原有逻辑的fallback
    console.log('🔄 使用fallback方案处理教师数据...')
    const { fixRecommendedCoursesTeacherData } = await import('./teacherDataFix.js')
    return fixRecommendedCoursesTeacherData(recommendedCourses)
  }
}

/**
 * 测试教师数据获取功能
 */
export async function testTeacherDataFetch() {
  console.log('🧪 测试教师数据获取功能...\n')
  
  const testCourses = [
    { id: 1, name: 'Vue.js 3 企业级开发实战', teacher: null },
    { id: 2, name: 'React 框架深入浅出', teacher: undefined },
    { id: 3, name: 'Spring Boot 微服务架构', teacher: '' }
  ]
  
  try {
    console.log('1️⃣ 测试单个教师数据获取...')
    const teacher1 = await fetchCourseTeacherFromBackend(1)
    console.log('单个获取结果:', teacher1)
    
    console.log('\n2️⃣ 测试批量教师数据获取...')
    const enrichedCourses = await fetchTeachersForCoursesFromBackend(testCourses)
    console.log('批量获取结果:', enrichedCourses)
    
    console.log('\n3️⃣ 测试推荐课程教师数据丰富...')
    const finalCourses = await enrichRecommendedCoursesWithTeacherData(testCourses)
    console.log('丰富后的课程:', finalCourses)
    
    console.log('\n✅ 教师数据获取功能测试完成')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  testTeacherDataFetch().then(() => {
    console.log('\n🏁 测试完成')
    process.exit(0)
  }).catch(error => {
    console.error('💥 测试崩溃:', error)
    process.exit(1)
  })
}