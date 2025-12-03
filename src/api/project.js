import request from '@/utils/request'

// 项目实训相关API
export const projectApi = {
  // 获取项目列表
  getProjects(params) {
    console.log('📋 获取项目实训列表，参数:', params)
    return request.get('/projects', { params })
  },
  
  // 获取项目详情
  getProjectDetail(projectId) {
    console.log(`🔍 获取项目实训详情: /projects/${projectId}`)
    return request.get(`/projects/${projectId}`)
  },
  
  // 申请项目实训
  applyProject(projectId, data) {
    console.log(`📝 申请项目实训: /projects/${projectId}/apply`)
    console.log('📋 申请数据:', data)
    return request.post(`/projects/${projectId}/apply`, data)
  },
  
  // 获取已申请的项目
  getAppliedProjects() {
    console.log('📋 获取已申请的项目实训')
    return request.get('/projects/applied')
  },
  
  // 获取项目统计数据
  getProjectStats() {
    console.log('📊 获取项目实训统计数据: /projects/stats')
    return request.get('/projects/stats')
  },
  
  // 获取项目进度
  getProjectProgress(projectId) {
    console.log(`📈 获取项目实训进度: /projects/${projectId}/progress`)
    return request.get(`/projects/${projectId}/progress`)
  },
  
  // 提交项目报告
  submitProjectReport(projectId, data) {
    console.log(`📄 提交项目实训报告: /projects/${projectId}/reports`)
    return request.post(`/projects/${projectId}/reports`, data)
  },
  
  // 获取项目报告列表
  getProjectReports(projectId) {
    console.log(`📋 获取项目实训报告: /projects/${projectId}/reports`)
    return request.get(`/projects/${projectId}/reports`)
  },
  
  // 评价项目
  evaluateProject(projectId, data) {
    console.log(`⭐ 评价项目实训: /projects/${projectId}/evaluate`)
    return request.post(`/projects/${projectId}/evaluate`, data)
  },
  
  // 取消项目申请
  cancelProjectApplication(projectId) {
    console.log(`❌ 取消项目实训申请: /projects/${projectId}/apply`)
    return request.delete(`/projects/${projectId}/apply`)
  },

  // 项目申请接口 (/api/projects/{projectId}/application)
  application(projectId, data) {
    console.log(`📝 项目申请: /projects/${projectId}/application`)
    console.log('📋 申请数据:', data)
    return request.post(`/projects/${projectId}/application`, data)
  },
  
  // 获取我的项目
  getMyProjects() {
    console.log('📋 获取我的项目实训列表')
    return request.get('/projects/my-projects')
  }
}