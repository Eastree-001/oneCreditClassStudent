// API配置文件

// API服务器IP地址常量 - 便于统一管理
export const API_IP = '192.168.1.150'
export const API_PORT = '8082'
export const API_BASE_PATH = '/api'

// 完整的基础URL
export const BASE_URL = `http://${API_IP}:${API_PORT}${API_BASE_PATH}`

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    // 认证相关
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    
    // 课程相关
    COURSES: '/courses',
    COURSE_DETAIL: (id) => `/courses/${id}`,
    COURSE_REVIEWS: (id) => `/courses/${id}/reviews`,
    SELECTED_COURSES: '/courses/selected',
    SELECT_COURSE: (id) => `/courses/${id}/select`,
    UNSELECT_COURSE: (id) => `/courses/${id}/select`, // DELETE请求到同一端点
    CONFIRM_SELECTION: '/courses/confirm-selection',
    RECOMMENDED_COURSES: '/courses/recommended',
    
    // 用户相关
    USER_INFO: '/user/info',
    USER_STATS: '/user/stats',
    
    // 作业相关
    ASSIGNMENTS: '/assignments',
    SUBMIT_ASSIGNMENT: (id) => `/assignments/${id}/submit`,
    
    // 学习进度相关
    PROGRESS_ASSIGNMENTS: '/progress/assignments',
    PROGRESS_SUBMIT_ASSIGNMENT: (id) => `/progress/assignments/${id}/submit`,
    PROGRESS_EXAMS: '/progress/exams',
    PROGRESS_COURSES: '/progress/courses',
    PROGRESS_STATS: '/progress/stats',
    PROGRESS_CREDITS_TREND: '/progress/credits-trend',
    PROGRESS_TIME_DISTRIBUTION: '/progress/time-distribution',
    
    // 待办事项
    TODOS: '/todos',
    TODO_DETAIL: (id) => `/todos/${id}`,
    
    // 项目相关
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id) => `/projects/${id}`,
    PROJECT_APPLICATION: (id) => `/projects/${id}/application`,
    PROJECT_APPLY: (id) => `/projects/${id}/apply`,
    PROJECTS_APPLIED: '/projects/applied',
    PROJECTS_STATS: '/projects/stats',
    PROJECT_PROGRESS: (id) => `/projects/${id}/progress`,
    PROJECT_REPORTS: (id) => `/projects/${id}/reports`,
    PROJECT_EVALUATE: (id) => `/projects/${id}/evaluate`,
    PROJECT_CANCEL_APPLICATION: (projectId, applicationId) => `/projects/${projectId}/applications/${applicationId}`,
    MY_PROJECTS: '/projects/my-projects'
  }
}

// 获取完整的API URL
export const getApiUrl = (endpoint) => {
  return API_CONFIG.BASE_URL + endpoint
}