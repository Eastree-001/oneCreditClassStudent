import request, { noTokenRequest } from '@/utils/request'
import { API_IP, API_PORT } from '@/config/api'

// 用户相关API
export const userApi = {
  // 用户登录 (使用noTokenRequest，因为登录接口不需要token)
  login(data) {
    return noTokenRequest.post('/auth/login', data)
  },
  
  // 发送验证码
  sendVerification(data) {
    return noTokenRequest.post('/auth/send-verification', data)
  },

  // 发送重置密码验证码
  sendResetCode(data) {
    return noTokenRequest.post('/auth/send-reset-code', data)
  },

  // 用户注册
  register(data) {
    return noTokenRequest.post('/auth/register', data)
  },

  // 忘记密码
  forgotPassword(data) {
    return noTokenRequest.post('/auth/forgot-password', data)
  },
  
  // 重置密码
  resetPassword(data) {
    return noTokenRequest.post('/auth/reset-password-with-code', data)
  },
  
  // 获取待办事项
  getTodos() {
    return request.get('/home/todos')
  },
  
  // 添加待办事项
  addTodo(data) {
    const requestData = {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 1
    }
    
    // 处理日期格式
    if (data.deadline) {
      const date = new Date(data.deadline)
      requestData.deadline = date.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
    } else {
      requestData.deadline = null
    }
    
    console.log('📋 添加待办事项请求数据:', requestData)
    return request.post('/home/todos', requestData)
  },
  
  // 更新待办事项
  updateTodo(id, data) {
    const requestData = {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 1,
      completed: data.completed
    }
    
    // 处理日期格式
    if (data.deadline) {
      const date = new Date(data.deadline)
      requestData.deadline = date.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
    } else {
      requestData.deadline = null
    }
    
    console.log('📋 更新待办事项请求数据:', requestData)
    return request.put(`/home/todos/${id}`, requestData)
  },
  
  // 获取待办事项详情
  getTodoDetail(id) {
    return request.get(`/home/todos`)
  },
  
  // 删除待办事项
  deleteTodo(id) {
    return request.delete(`/home/todos/${id}`)
  },
  
  // 提交作业
  submitAssignment(assignmentId, data) {
    return request.post(`/progress/assignments/${assignmentId}/submit`, data)
  },
  
  // 获取课程列表
  getProgressCourses() {
    return request.get('/progress/courses')
  },
  
  // 获取已选择的课程
  getSelectedCourses() {
    return request.get('/courses/selected')
  },
  
  // 获取学分获取趋势数据
  getCreditsTrend() {
    return request.get('/progress/credits-trend')
  },
  
  // 获取学习时长分布数据
  getTimeDistribution() {
    return request.get('/progress/time-distribution')
  },
  
  // 获取作业列表
  getAssignments() {
    return request.get('/progress/assignments')
  },
  
  // 获取考试列表
  getExams() {
    return request.get('/progress/exams')
  },
  
  // 获取课程详情
  getCourseDetail(courseId) {
    return request.get(`/progress/courses/${courseId}`)
  },
  
  // 获取作业详情
  getAssignmentDetail(assignmentId) {
    return request.get(`/progress/assignments/${assignmentId}`)
  },
  
  // 获取学习进度统计数据
  getProgressStats() {
    return request.get('/progress/stats')
  },
  
  // 获取学习统计图表数据
  getStudyChartData() {
    return request.get('/home/study-chart')
  },
  
  // 获取学习统计数据
  getStudyStats() {
    return request.get('/home/study-stats')
  },
  
  // 获取学生技能分布数据
  getSkillsData() {
    return request.get('/home/skills')
  },
  
  // 获取最近学习的课程
  getRecentCourses() {
    return request.get('/home/recent-courses')
  },
  
  // 获取学习日历事件
  getCalendarEvents(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.year) queryParams.append('year', params.year)
    if (params.month) queryParams.append('month', params.month)
    
    const url = queryParams.toString() 
      ? `/home/calendar-events?${queryParams.toString()}`
      : '/home/calendar-events'
    
    console.log('📅 获取日历事件请求URL:', url)
    return request.get(url)
  },
  
  // 获取今日事件列表
  getTodayEvents() {
    return request.get('/home/today-events')
  },
  
  // 获取通知公告列表
  getNotices() {
    return request.get('/home/notices')
  },
  

  // 退出登录
  logout() {
    return request.post('/auth/logout')
  },
  
  // 获取用户信息 (认证端点)
  getAuthUserInfo() {
    return request.get('/auth/me')
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info')
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data)
  },
  
  // 获取统计数据 (首页)
  getHomeStats() {
    return request.get('/home/stats')
  },
  
  // 获取学习统计图表数据
  getStudyChart() {
    return request.get('/home/study-chart')
  },
  
  // 获取统计数据 (用户端点)
  getStats() {
    return request.get('/user/stats')
  },
  
  // 获取推荐课程 (需要认证)
  getRecommendedCourses() {
    console.log('👤 用户API调用推荐课程: /courses/recommended')
    return request.get('/courses/recommended')
  },

  // 获取学校列表
  getSchools() {
    console.log('🏫 获取学校列表: /api/common/schools')
    // 使用完整的URL避免路径重复
    const fullUrl = `http://${API_IP}:${API_PORT}/api/common/university/list`
    return noTokenRequest.get(fullUrl)
  },

  // ========== 佣金币相关API ==========
  
  // 获取兑换汇率
  getExchangeRate() {
    console.log('💰 获取兑换汇率: /coin-exchange/rate')
    return request.get('/coin-exchange/rate')
  },

  // 申请兑换
  applyExchange(data) {
    console.log('💰 申请兑换佣金币:', data)
    return request.post('/coin-exchange/apply', data)
  },

  // 获取我的兑换申请列表
  getExchangeApplications(params) {
    console.log('💰 获取兑换申请列表:', params)
    return request.get('/coin-exchange/applications', { params })
  },

  // 获取兑换申请详情
  getExchangeApplicationDetail(applicationId) {
    console.log(`💰 获取兑换申请详情: /coin-exchange/applications/${applicationId}`)
    return request.get(`/coin-exchange/applications/${applicationId}`)
  },

  // 取消兑换申请
  cancelExchangeApplication(applicationId) {
    console.log(`💰 取消兑换申请: /coin-exchange/applications/${applicationId}/cancel`)
    return request.put(`/coin-exchange/applications/${applicationId}/cancel`)
  },

  // 获取佣金币交易记录
  getCoinTransactions(params) {
    console.log('💰 获取佣金币交易记录:', params)
    return request.get('/user/commission-coins/transactions', { params })
  }
}