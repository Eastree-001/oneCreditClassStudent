// API配置文件
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.134:8082/api',
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
    MY_PROJECTS: '/projects/my-projects'
  }
}

// 获取完整的API URL
export const getApiUrl = (endpoint) => {
  return API_CONFIG.BASE_URL + endpoint
}