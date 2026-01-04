import request, { commonRequest } from '@/utils/request'

export const courseApi = {
  // 获取课程列表
  getCourses(params) {
    return request.get('/courses', { params })
  },
  
  // 选课
  selectCourse(courseId) {
    return request.post(`/courses/${courseId}/select`)
  },
  
  // 删除已选课程
  unselectCourse(courseId) {
    console.log(`🗑️ 删除已选课程: /courses/${courseId}/select`)
    return request.delete(`/courses/${courseId}/select`)
  },
  
  // 获取学习进度
  getProgress(courseId) {
    return request.get(`/courses/${courseId}/progress`)
  },
  
  // 确认选课
  confirmSelection(courseIds) {
    return request.post('/courses/confirm-selection', { courseIds })
  },
  
  // 获取推荐课程
  getRecommendedCourses() {
    console.log('📡 调用推荐课程API: /courses/recommended')
    return request.get('/courses/recommended')
  },
  
  // 获取单个课程详情（推荐课程详情）
  getCourseDetail(courseId) {
    console.log(`🔍 获取课程详情: /courses/${courseId}`)
    return request.get(`/courses/${courseId}`)
  },
  
  // 获取课程评价列表
  getCourseReviews(courseId) {
    console.log(`📝 获取课程评价: /courses/${courseId}/reviews`)
    return request.get(`/courses/${courseId}/reviews`)
  },
  
  // 获取课程指导教师信息
  getCourseTeacher(courseId) {
    console.log(`👨‍🏫 获取课程教师: /courses/${courseId}/teacher`)
    return request.get(`/courses/${courseId}/teacher`)
  },
  
  // 批量获取课程教师信息
  getBatchCourseTeachers(courseIds) {
    console.log(`👥 批量获取课程教师: /courses/teachers`)
    return request.post('/courses/teachers', { courseIds })
  },

  // 获取课程视频列表
  getCourseVideos(courseId) {
    console.log(`🎬 获取课程视频: /videos/course/${courseId}`)
    return commonRequest.get(`/videos/course/${courseId}`)
  }
}