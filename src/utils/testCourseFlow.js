// 测试选课和学习进度数据流
// 这个文件用于验证选课功能和学习进度显示是否正常

const testCourseFlow = async () => {
  console.log('🧪 开始测试选课和学习进度数据流...')
  
  try {
    // 动态导入API模块
    const { userApi } = await import('../api/user.js')
    const { courseApi } = await import('../api/course.js')
    
    // 1. 测试获取所有可选课程
    console.log('\n📚 1. 测试获取所有可选课程...')
    try {
      const allCoursesResponse = await courseApi.getCourses()
      console.log('📝 所有课程响应:', allCoursesResponse)
      
      let allCourses = []
      if (allCoursesResponse && typeof allCoursesResponse === 'object') {
        if ('code' in allCoursesResponse) {
          const successCodes = [200, 0, 201, 204]
          if (successCodes.includes(allCoursesResponse.code)) {
            allCourses = allCoursesResponse.data || allCoursesResponse || []
          }
        } else {
          allCourses = allCoursesResponse || []
        }
      }
      
      console.log(`✅ 可选课程总数: ${allCourses.length}`)
      console.log('📋 前3个课程:', allCourses.slice(0, 3))
      
      // 显示已选课程状态
      const selectedCourses = allCourses.filter(course => 
        course.isSelected === true || course.selected === true || course.alreadySelected === true
      )
      console.log(`🎯 已选课程数量: ${selectedCourses.length}`)
      if (selectedCourses.length > 0) {
        console.log('📋 已选课程:', selectedCourses)
      }
      
    } catch (error) {
      console.error('❌ 获取所有课程失败:', error.message)
    }
    
    // 2. 测试获取学习进度课程
    console.log('\n📖 2. 测试获取学习进度课程...')
    try {
      const progressCoursesResponse = await userApi.getProgressCourses()
      console.log('📝 学习进度响应:', progressCoursesResponse)
      
      let progressCourses = []
      if (progressCoursesResponse && typeof progressCoursesResponse === 'object') {
        if ('code' in progressCoursesResponse) {
          const successCodes = [200, 0, 201, 204]
          if (successCodes.includes(progressCoursesResponse.code)) {
            progressCourses = progressCoursesResponse.data || progressCoursesResponse || []
          }
        } else {
          progressCourses = progressCoursesResponse || []
        }
      }
      
      console.log(`✅ 学习进度课程数量: ${progressCourses.length}`)
      if (progressCourses.length > 0) {
        console.log('📋 学习进度课程:', progressCourses.slice(0, 3))
      } else {
        console.log('⚠️ 学习进度课程为空 - 这可能是问题的根源')
      }
      
    } catch (error) {
      console.error('❌ 获取学习进度课程失败:', error.message)
      console.log('💡 建议检查: /api/progress/courses 端点是否正确实现')
    }
    
    // 3. 测试选课功能
    console.log('\n➕ 3. 测试选课功能...')
    if (allCourses && allCourses.length > 0) {
      const testCourse = allCourses[0]
      console.log(`🎯 测试选择课程: ${testCourse.name} (ID: ${testCourse.id})`)
      
      try {
        const selectResponse = await courseApi.selectCourse(testCourse.id)
        console.log('📝 选课响应:', selectResponse)
        
        let success = false
        if (selectResponse && typeof selectResponse === 'object') {
          if ('code' in selectResponse) {
            const successCodes = [200, 0, 201, 204]
            success = successCodes.includes(selectResponse.code)
          } else {
            success = true
          }
        }
        
        console.log(`✅ 选${success ? '成功' : '失败'}`)
        
        // 再次获取学习进度，看看是否有新数据
        if (success) {
          console.log('🔄 选课成功，重新获取学习进度...')
          const newProgressResponse = await userApi.getProgressCourses()
          console.log('📝 新的学习进度响应:', newProgressResponse)
        }
        
      } catch (error) {
        console.error('❌ 选课失败:', error.message)
      }
    } else {
      console.log('⚠️ 没有可选课程进行测试')
    }
    
    console.log('\n🏁 测试完成')
    console.log('\n💡 问题诊断建议:')
    console.log('1. 如果学习进度课程为空，检查服务器端是否正确保存了选课记录')
    console.log('2. 如果选课API成功但学习进度仍为空，检查两个API是否使用相同的数据源')
    console.log('3. 确认API端点 /api/progress/courses 是否正确实现')
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error)
  }
}

export { testCourseFlow }