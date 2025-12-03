/**
 * 教师数据修复和验证工具
 * 用于诊断和修复推荐课程中教师字段的问题
 */

// 模拟后端API响应数据结构
export const mockTeacherData = {
  // 正常的教师数据
  validTeacherCourse: {
    id: 1,
    name: "Vue.js 3 企业级开发实战",
    teacher: "张教授", // 正确的教师字段
    enterprise: "腾讯科技",
    category: "前端开发"
  },
  
  // 缺失教师数据的课程
  missingTeacherCourse: {
    id: 2,
    name: "React 框架深入浅出",
    teacher: null, // 教师字段为null
    enterprise: "字节跳动",
    category: "前端开发"
  },
  
  // 教师字段为空字符串
  emptyTeacherCourse: {
    id: 3,
    name: "Spring Boot 微服务架构",
    teacher: "", // 教师字段为空字符串
    enterprise: "阿里云",
    category: "后端开发"
  }
}

/**
 * 验证教师数据的完整性
 * @param {Object} course 课程对象
 * @returns {Object} 验证结果
 */
export function validateTeacherData(course) {
  const result = {
    isValid: false,
    teacher: '未知教师',
    issue: null,
    source: 'fallback'
  }

  if (!course) {
    result.issue = '课程对象为空'
    return result
  }

  // 检查教师字段
  if (course.teacher && typeof course.teacher === 'string' && course.teacher.trim()) {
    result.isValid = true
    result.teacher = course.teacher.trim()
    result.source = 'backend'
    console.log(`✅ 课程 "${course.name}" 教师数据有效: ${result.teacher}`)
  } else if (course.teacher === null) {
    result.issue = '教师字段为null'
    console.warn(`⚠️ 课程 "${course.name}" 教师字段为null`)
  } else if (course.teacher === '') {
    result.issue = '教师字段为空字符串'
    console.warn(`⚠️ 课程 "${course.name}" 教师字段为空字符串`)
  } else if (course.teacher === undefined) {
    result.issue = '教师字段未定义'
    console.warn(`⚠️ 课程 "${course.name}" 教师字段未定义`)
  } else {
    result.issue = `教师字段类型异常: ${typeof course.teacher}`
    console.warn(`⚠️ 课程 "${course.name}" 教师字段类型异常: ${typeof course.teacher}`)
  }

  return result
}

/**
 * 修复推荐课程中的教师数据
 * @param {Array} courses 推荐课程列表
 * @returns {Array} 修复后的课程列表
 */
export function fixRecommendedCoursesTeacherData(courses) {
  if (!Array.isArray(courses)) {
    console.error('❌ 传入的课程列表不是数组')
    return []
  }

  console.log(`🔧 开始修复 ${courses.length} 门推荐课程的教师数据...`)

  const fixedCourses = courses.map((course, index) => {
    const validation = validateTeacherData(course)
    
    console.log(`📚 处理课程 ${index + 1}: ${course.name}`)
    console.log(`  原始教师: ${course.teacher}`)
    console.log(`  修复后教师: ${validation.teacher}`)
    console.log(`  数据来源: ${validation.source}`)
    console.log(`  存在问题: ${validation.issue || '无'}`)

    return {
      ...course,
      teacher: validation.teacher,
      _teacherSource: validation.source,
      _teacherIssue: validation.issue,
      hasValidTeacher: validation.isValid
    }
  })

  // 统计修复结果
  const validCount = fixedCourses.filter(c => c.hasValidTeacher).length
  const invalidCount = fixedCourses.length - validCount
  
  console.log('\n📊 教师数据修复统计:')
  console.log(`  总课程数: ${fixedCourses.length}`)
  console.log(`  有效教师数据: ${validCount}`)
  console.log(`  无效教师数据: ${invalidCount}`)
  console.log(`  数据完整性: ${(validCount / fixedCourses.length * 100).toFixed(1)}%`)

  return fixedCourses
}

/**
 * 创建教师数据诊断报告
 * @param {Array} courses 课程列表
 * @returns {Object} 诊断报告
 */
export function createTeacherDataDiagnostic(courses) {
  const report = {
    totalCourses: courses.length,
    validTeachers: 0,
    invalidTeachers: 0,
    issues: {},
    recommendations: []
  }

  courses.forEach(course => {
    const validation = validateTeacherData(course)
    
    if (validation.isValid) {
      report.validTeachers++
    } else {
      report.invalidTeachers++
      
      // 统计问题类型
      const issue = validation.issue || '未知问题'
      report.issues[issue] = (report.issues[issue] || 0) + 1
    }
  })

  // 生成修复建议
  if (report.invalidTeachers > 0) {
    report.recommendations.push('检查后端API返回的教师字段数据格式')
    report.recommendations.push('确保数据库中的教师信息不为空')
    report.recommendations.push('添加数据验证层确保教师字段完整性')
  }

  if (report.invalidTeachers === report.totalCourses) {
    report.recommendations.push('可能是API认证问题，检查用户token有效性')
  }

  return report
}

/**
 * 测试教师数据处理
 */
export function testTeacherDataProcessing() {
  console.log('🧪 开始测试教师数据处理...\n')

  // 测试数据
  const testCourses = [
    mockTeacherData.validTeacherCourse,
    mockTeacherData.missingTeacherCourse,
    mockTeacherData.emptyTeacherCourse
  ]

  // 测试修复功能
  const fixedCourses = fixRecommendedCoursesTeacherData(testCourses)
  
  // 生成诊断报告
  const report = createTeacherDataDiagnostic(testCourses)
  
  console.log('\n📋 诊断报告:')
  console.log(JSON.stringify(report, null, 2))

  return {
    fixedCourses,
    report
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  testTeacherDataProcessing()
}