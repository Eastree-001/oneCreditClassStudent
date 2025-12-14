import request from '@/utils/request'

// 考研模块API
export const postgraduateApi = {
  // ========== 科目优化赋能 ==========
  // 获取所有考研科目
  getSubjects() {
    return request.get('/postgraduate/subjects')
  },
  
  // 获取科目详情（包含重点知识点）
  getSubjectDetail(subjectId) {
    return request.get(`/postgraduate/subjects/${subjectId}`)
  },
  
  // 获取科目重点知识点
  getKeyKnowledgePoints(subjectId) {
    return request.get(`/postgraduate/subjects/${subjectId}/knowledge-points`)
  },
  
  // 标记知识点学习状态
  updateKnowledgePointStatus(pointId, status) {
    return request.put(`/postgraduate/knowledge-points/${pointId}/status`, { status })
  },
  
  // ========== 题库系统 ==========
  // 获取题库分类
  getQuestionCategories() {
    return request.get('/postgraduate/question-bank/categories')
  },
  
  // 获取题目列表
  getQuestions(params) {
    return request.get('/postgraduate/question-bank/questions', { params })
  },
  
  // 获取题目详情
  getQuestionDetail(questionId) {
    return request.get(`/postgraduate/question-bank/questions/${questionId}`)
  },
  
  // 提交答案
  submitAnswer(questionId, data) {
    return request.post(`/postgraduate/question-bank/questions/${questionId}/answer`, data)
  },
  
  // 获取答题记录
  getAnswerHistory(params) {
    return request.get('/postgraduate/question-bank/answer-history', { params })
  },
  
  // 获取错题本
  getWrongQuestions(params) {
    return request.get('/postgraduate/question-bank/wrong-questions', { params })
  },
  
  // ========== 个人成长路线 ==========
  // 获取个人成长路线
  getGrowthPath() {
    return request.get('/postgraduate/growth-path')
  },
  
  // 更新成长路线节点状态
  updatePathNode(nodeId, status) {
    return request.put(`/postgraduate/growth-path/nodes/${nodeId}`, { status })
  },
  
  // 获取学习计划
  getStudyPlan() {
    return request.get('/postgraduate/growth-path/study-plan')
  },
  
  // 创建/更新学习计划
  saveStudyPlan(data) {
    return request.post('/postgraduate/growth-path/study-plan', data)
  },
  
  // ========== 保研建议 ==========
  // 获取保研政策列表
  getRecommendationPolicies() {
    return request.get('/postgraduate/recommendation/policies')
  },
  
  // 获取保研建议（基于学生信息）
  getRecommendationAdvice() {
    return request.get('/postgraduate/recommendation/advice')
  },
  
  // 获取保研院校推荐
  getRecommendedUniversities(params) {
    return request.get('/postgraduate/recommendation/universities', { params })
  },
  
  // ========== AI教师问答 ==========
  // 发送问题给AI教师
  askAITeacher(data) {
    return request.post('/postgraduate/ai-teacher/ask', data)
  },
  
  // 获取问答历史
  getAIConversationHistory(params) {
    return request.get('/postgraduate/ai-teacher/conversations', { params })
  },
  
  // 获取AI教师推荐问题
  getRecommendedQuestions() {
    return request.get('/postgraduate/ai-teacher/recommended-questions')
  },
  
  // ========== 教师入驻 ==========
  // 申请成为教师
  applyAsTeacher(data) {
    return request.post('/postgraduate/teacher/apply', data)
  },
  
  // 获取申请状态
  getApplicationStatus() {
    return request.get('/postgraduate/teacher/application-status')
  },
  
  // 获取教师列表
  getTeachers(params) {
    return request.get('/postgraduate/teacher/list', { params })
  },
  
  // 获取教师详情
  getTeacherDetail(teacherId) {
    return request.get(`/postgraduate/teacher/${teacherId}`)
  },
  
  // ========== 智能督学（核心功能） ==========
  // 获取督学仪表盘数据
  getSupervisionDashboard() {
    return request.get('/postgraduate/supervision/dashboard')
  },
  
  // 获取学习统计
  getStudyStatistics(params) {
    return request.get('/postgraduate/supervision/statistics', { params })
  },
  
  // 获取学习提醒
  getStudyReminders() {
    return request.get('/postgraduate/supervision/reminders')
  },
  
  // 创建学习提醒
  createReminder(data) {
    return request.post('/postgraduate/supervision/reminders', data)
  },
  
  // 更新提醒状态
  updateReminderStatus(reminderId, status) {
    return request.put(`/postgraduate/supervision/reminders/${reminderId}`, { status })
  },
  
  // 获取学习打卡记录
  getCheckInHistory(params) {
    return request.get('/postgraduate/supervision/check-ins', { params })
  },
  
  // 学习打卡
  checkIn(data) {
    return request.post('/postgraduate/supervision/check-ins', data)
  },
  
  // 获取学习报告
  getStudyReport(params) {
    return request.get('/postgraduate/supervision/report', { params })
  },
  
  // 获取督学建议
  getSupervisionAdvice() {
    return request.get('/postgraduate/supervision/advice')
  }
}

