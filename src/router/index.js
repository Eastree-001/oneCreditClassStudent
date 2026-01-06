import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { title: '重置密码', requiresAuth: false }
  },
  {
    path: '/video-learning/:courseId',
    name: 'VideoLearning',
    component: () => import('@/views/VideoLearning.vue'),
    meta: { title: '视频学习', requiresAuth: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'progress',
        name: 'Progress',
        component: () => import('@/views/Progress.vue'),
        meta: { title: '学习进度', icon: 'DataAnalysis' }
      },
      {
        path: 'course-selection',
        name: 'CourseSelection',
        component: () => import('@/views/CourseSelection.vue'),
        meta: { title: '选课', icon: 'Document' }
      },
      {
        path: 'project-training',
        name: 'ProjectTraining',
        component: () => import('@/views/ProjectTraining.vue'),
        meta: { title: '项目实训', icon: 'Briefcase' }
      },
      {
        path: 'recruitment',
        name: 'Recruitment',
        component: () => import('@/views/Recruitment.vue'),
        meta: { title: '企业直聘', icon: 'Promotion' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        // 个人中心：通过头像下拉进入，不在侧边导航栏展示
        meta: { title: '个人中心', icon: 'User', hiddenInMenu: true }
      },
      {
        path: 'postgraduate',
        component: () => import('@/views/Postgraduate/Layout.vue'),
        meta: { title: '考研专区', icon: 'Reading' },
        children: [
          {
            path: '',
            name: 'PostgraduateIndex',
            component: () => import('@/views/Postgraduate/Index.vue'),
            meta: { title: '考研首页' }
          },
          {
            path: 'subject-optimization',
            name: 'SubjectOptimization',
            component: () => import('@/views/Postgraduate/SubjectOptimization.vue'),
            meta: { title: '科目优化' }
          },
          {
            path: 'question-bank',
            name: 'QuestionBank',
            component: () => import('@/views/Postgraduate/QuestionBank.vue'),
            meta: { title: '题库练习' }
          },
          {
            path: 'growth-path',
            name: 'GrowthPath',
            component: () => import('@/views/Postgraduate/GrowthPath.vue'),
            meta: { title: '成长路线' }
          },
          {
            path: 'recommendation-advice',
            name: 'RecommendationAdvice',
            component: () => import('@/views/Postgraduate/RecommendationAdvice.vue'),
            meta: { title: '保研建议' }
          },
          {
            path: 'ai-teacher',
            name: 'AITeacher',
            component: () => import('@/views/Postgraduate/AITeacher.vue'),
            meta: { title: 'AI教师' }
          },
          {
            path: 'teacher-application',
            name: 'TeacherApplication',
            component: () => import('@/views/Postgraduate/TeacherApplication.vue'),
            meta: { title: '教师入驻' }
          },
          {
            path: 'smart-supervision',
            name: 'SmartSupervision',
            component: () => import('@/views/Postgraduate/SmartSupervision.vue'),
            meta: { title: '智能督学' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 这里可以检查用户是否已登录
    // 暂时模拟已登录状态，实际应该从 localStorage 或 store 中获取
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    
    if (!isAuthenticated) {
      // 未登录，跳转到登录页
      next('/login')
    } else {
      next()
    }
  } else {
    // 如果已登录访问登录页，重定向到首页
    if (to.path === '/login' && localStorage.getItem('isAuthenticated') === 'true') {
      next('/home')
    } else {
      next()
    }
  }
})

export default router
