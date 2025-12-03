<template>
  <div class="project-training-container">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">项目实训</h1>
          <p class="page-desc">选择企业真实项目进行实训，提升实战能力</p>
        </div>
        <div class="header-actions">
          <el-button 
            :type="showMyProjects ? 'default' : 'primary'" 
            @click="handleShowAllProjects"
          >
            <el-icon><Collection /></el-icon>
            全部项目
          </el-button>
          <el-button 
            :type="showMyProjects ? 'primary' : 'default'" 
            @click="handleShowMyProjects"
          >
            <el-icon><User /></el-icon>
            我的项目
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in statistics" :key="stat.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 - 只在显示全部项目时显示 -->
    <el-card v-if="!showMyProjects" class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="项目类型">
          <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="Web开发" value="Web开发" />
            <el-option label="移动开发" value="移动开发" />
            <el-option label="数据分析" value="数据分析" />
            <el-option label="人工智能" value="人工智能" />
            <el-option label="系统开发" value="系统开发" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级">
          <el-select v-model="filterForm.difficulty" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="可报名" value="可报名" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索项目名称"
            clearable
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的项目提示信息 -->
    <el-alert
      v-if="showMyProjects"
      title="我的项目"
      type="info"
      :description="`当前显示您参与的项目，共 ${filteredProjects.length} 个`"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <!-- 项目列表 -->
    <div v-loading="loading" class="projects-grid">
      <el-card
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        shadow="hover"
      >
        <div class="project-header">
          <div class="project-badge" :style="{ background: getDifficultyColor(project.difficulty) }">
            {{ project.difficulty }}
          </div>
          <el-tag :type="getStatusType(project.status)" size="small">
            {{ project.status }}
          </el-tag>
        </div>

        <div class="project-content">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-desc">{{ project.description }}</p>

          <div class="project-info">
            <div class="info-row">
              <div class="info-item">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ project.company }}</span>
              </div>
              <div class="info-item">
                <el-icon><Briefcase /></el-icon>
                <span>{{ project.type }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>{{ project.duration }}周</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ project.enrolled }}/{{ project.capacity }}人</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <el-icon><Trophy /></el-icon>
                <span>{{ project.credits }}学分</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ project.startDate }}</span>
              </div>
            </div>
          </div>

          <div class="project-skills">
            <span class="skills-label">技能要求：</span>
            <el-tag
              v-for="skill in project.skills"
              :key="skill"
              size="small"
              class="skill-tag"
            >
              {{ skill }}
            </el-tag>
          </div>

          <!-- 项目进度信息 - 仅在我的项目中显示 -->
          <div v-if="showMyProjects && project.progress" class="project-progress">
            <div class="progress-header">
              <span class="progress-label">项目进度：</span>
              <span class="progress-text">{{ project.progress.percentage || 0 }}%</span>
            </div>
            <el-progress 
              :percentage="project.progress.percentage || 0" 
              :status="project.progress.status || 'normal'"
              :show-text="false"
              class="progress-bar"
            />
            <div v-if="project.progress.description" class="progress-description">
              {{ project.progress.description }}
            </div>
          </div>

          <div class="project-footer">
            <el-button
              type="primary"
              :disabled="project.status !== '可报名' || project.enrolled >= project.capacity"
              @click="handleApply(project)"
              v-if="!showMyProjects"
            >
              <el-icon><CircleCheck /></el-icon>
              {{ project.status === '可报名' && project.enrolled < project.capacity ? '立即报名' : '不可报名' }}
            </el-button>
            <el-button @click="handleViewDetail(project)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button
              type="success"
              @click="handleRefreshProgress(project)"
              v-if="showMyProjects"
              :loading="refreshingProgress && refreshingProjectId === project.id"
              size="small"
            >
              <el-icon><Refresh /></el-icon>
              刷新进度
            </el-button>
            <el-button
              type="danger"
              @click="handleDeleteProject(project)"
              v-if="showMyProjects"
              :loading="deleting && deletingProjectId === project.id"
            >
              <el-icon><Delete /></el-icon>
              删除报名
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 27, 36]"
        :total="filteredProjects.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 项目详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="selectedProjectDetail?.name"
      width="900px"
    >
      <div v-if="selectedProjectDetail" class="project-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">
            {{ selectedProjectDetail.name }}
          </el-descriptions-item>
          <el-descriptions-item label="合作企业">
            {{ selectedProjectDetail.company }}
          </el-descriptions-item>
          <el-descriptions-item label="项目类型">
            {{ selectedProjectDetail.type }}
          </el-descriptions-item>
          <el-descriptions-item label="难度等级">
            <el-tag :style="{ background: getDifficultyColor(selectedProjectDetail.difficulty), color: 'white', border: 'none' }">
              {{ selectedProjectDetail.difficulty }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目时长">
            {{ selectedProjectDetail.duration }}周
          </el-descriptions-item>
          <el-descriptions-item label="可获得学分">
            {{ selectedProjectDetail.credits }}学分
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ selectedProjectDetail.startDate }}
          </el-descriptions-item>
          <el-descriptions-item label="报名人数">
            {{ selectedProjectDetail.enrolled }}/{{ selectedProjectDetail.capacity }}人
          </el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="getStatusType(selectedProjectDetail.status)">
              {{ selectedProjectDetail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="技能要求" :span="2">
            <el-tag
              v-for="skill in selectedProjectDetail.skills"
              :key="skill"
              size="small"
              class="skill-tag"
            >
              {{ skill }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目简介" :span="2">
            {{ selectedProjectDetail.description }}
          </el-descriptions-item>
          <el-descriptions-item label="项目内容" :span="2">
            <ul class="project-content-list">
              <li v-for="(item, index) in selectedProjectDetail.content" :key="index">
                {{ item }}
              </li>
            </ul>
          </el-descriptions-item>
          <el-descriptions-item label="项目收获" :span="2">
            <ul class="project-content-list">
              <li v-for="(item, index) in selectedProjectDetail.gains" :key="index">
                {{ item }}
              </li>
            </ul>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="handleApplyFromDetail"
          :disabled="selectedProjectDetail?.status !== '可报名' || selectedProjectDetail?.enrolled >= selectedProjectDetail?.capacity"
        >
          立即报名
        </el-button>
      </template>
    </el-dialog>

    <!-- 报名对话框 -->
    <el-dialog
      v-model="applyDialogVisible"
      title="项目报名"
      width="600px"
    >
      <el-form
        v-if="selectedProject"
        :model="applyForm"
        :rules="applyRules"
        ref="applyFormRef"
        label-width="100px"
      >
        <el-form-item label="项目名称">
          <el-input v-model="selectedProject.name" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="applyForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="applyForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="applyForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="applyForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="个人简介" prop="introduction">
          <el-input
            v-model="applyForm.introduction"
            type="textarea"
            :rows="4"
            placeholder="请简要介绍您的项目经验、技能水平等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApply">提交报名</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  View,
  CircleCheck,
  Briefcase,
  OfficeBuilding,
  Clock,
  User,
  Trophy,
  Calendar,
  Collection,
  TrendCharts,
  DataAnalysis,
  Delete,
  Refresh
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'
import { projectApi, userApi } from '@/api'

const filterForm = ref({
  type: '',
  difficulty: '',
  status: '',
  keyword: ''
})

const currentPage = ref(1)
const pageSize = ref(9)
const detailDialogVisible = ref(false)
const applyDialogVisible = ref(false)
const selectedProjectDetail = ref(null)
const selectedProject = ref(null)
const applyFormRef = ref(null)
const showMyProjects = ref(false)
const myProjects = ref([])
const loading = ref(false)
const deleting = ref(false)
const deletingProjectId = ref(null)
const refreshingProgress = ref(false)
const refreshingProjectId = ref(null)

const applyForm = ref({
  name: '',
  studentId: '',
  phone: '',
  email: '',
  introduction: ''
})

const applyRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  introduction: [{ required: true, message: '请输入个人简介', trigger: 'blur' }]
}

// 统计数据 - 初始化为默认值，会通过API更新
const statistics = ref([
  {
    label: '可报名项目',
    value: '0',
    icon: 'Collection',
    color: themeColors.gradientPrimary
  },
  {
    label: '已报名项目',
    value: '0',
    icon: 'Briefcase',
    color: themeColors.gradientPink
  },
  {
    label: '已完成项目',
    value: '0',
    icon: 'Trophy',
    color: themeColors.gradientBlue
  },
  {
    label: '获得学分',
    value: '0',
    icon: 'DataAnalysis',
    color: themeColors.gradientGreen
  }
])

const allProjects = ref([
  {
    id: 1,
    name: '电商平台前端开发',
    description: '参与大型电商平台的前端开发，使用Vue3+TypeScript构建现代化的用户界面，实现购物车、订单管理等核心功能。',
    company: '阿里巴巴',
    type: 'Web开发',
    difficulty: '中级',
    duration: 12,
    credits: 1,
    startDate: '2024-03-01',
    enrolled: 15,
    capacity: 20,
    status: '可报名',
    skills: ['Vue.js', 'TypeScript', 'Element Plus', 'Vite'],
    content: [
      '参与电商平台前端架构设计',
      '实现商品展示、购物车、订单等核心功能',
      '优化页面性能和用户体验',
      '与后端团队协作完成接口对接'
    ],
    gains: [
      '掌握大型项目的前端开发流程',
      '提升Vue3和TypeScript实战能力',
      '学习企业级代码规范和最佳实践',
      '获得1学分'
    ]
  },
  {
    id: 2,
    name: '移动端App开发',
    description: '使用React Native开发跨平台移动应用，实现用户注册登录、内容浏览、社交互动等功能模块。',
    company: '腾讯',
    type: '移动开发',
    difficulty: '中级',
    duration: 16,
    credits: 1,
    startDate: '2024-03-15',
    enrolled: 18,
    capacity: 25,
    status: '可报名',
    skills: ['React Native', 'JavaScript', 'Redux', 'Node.js'],
    content: [
      '使用React Native开发移动应用',
      '实现用户认证和权限管理',
      '开发内容浏览和社交功能',
      '进行应用性能优化和测试'
    ],
    gains: [
      '掌握移动端开发技术',
      '学习跨平台开发方案',
      '了解移动应用发布流程',
      '获得1学分'
    ]
  },
  {
    id: 3,
    name: '数据分析与可视化',
    description: '对电商平台销售数据进行深度分析，使用Python进行数据清洗和挖掘，并制作可视化报表。',
    company: '京东',
    type: '数据分析',
    difficulty: '高级',
    duration: 10,
    credits: 1,
    startDate: '2024-02-20',
    enrolled: 12,
    capacity: 15,
    status: '进行中',
    skills: ['Python', 'Pandas', 'Matplotlib', 'SQL'],
    content: [
      '数据清洗和预处理',
      '销售数据分析和挖掘',
      '制作数据可视化报表',
      '撰写数据分析报告'
    ],
    gains: [
      '掌握数据分析全流程',
      '提升Python数据处理能力',
      '学习数据可视化技巧',
      '获得1学分'
    ]
  },
  {
    id: 4,
    name: '智能推荐系统',
    description: '基于机器学习算法开发个性化推荐系统，使用协同过滤和深度学习技术提升推荐准确率。',
    company: '字节跳动',
    type: '人工智能',
    difficulty: '高级',
    duration: 14,
    credits: 1,
    startDate: '2024-04-01',
    enrolled: 8,
    capacity: 15,
    status: '可报名',
    skills: ['Python', 'TensorFlow', '机器学习', '推荐算法'],
    content: [
      '研究推荐算法原理',
      '实现协同过滤算法',
      '使用深度学习优化推荐效果',
      '评估和优化推荐系统性能'
    ],
    gains: [
      '深入理解推荐系统原理',
      '掌握机器学习实战应用',
      '学习模型训练和优化',
      '获得1学分'
    ]
  },
  {
    id: 5,
    name: '企业管理系统开发',
    description: '开发企业内部管理系统，包括人事管理、财务管理、项目管理等模块，使用Spring Boot和Vue.js。',
    company: '华为',
    type: '系统开发',
    difficulty: '中级',
    duration: 12,
    credits: 1,
    startDate: '2024-03-10',
    enrolled: 20,
    capacity: 20,
    status: '已结束',
    skills: ['Java', 'Spring Boot', 'Vue.js', 'MySQL'],
    content: [
      '系统需求分析和设计',
      '后端API开发',
      '前端界面开发',
      '系统测试和部署'
    ],
    gains: [
      '掌握全栈开发技能',
      '学习企业级系统设计',
      '了解系统开发流程',
      '获得1学分'
    ]
  },
  {
    id: 6,
    name: '微服务架构实践',
    description: '基于Spring Cloud构建微服务架构，实现服务注册发现、配置中心、网关路由等功能。',
    company: '美团',
    type: '系统开发',
    difficulty: '高级',
    duration: 14,
    credits: 1,
    startDate: '2024-04-10',
    enrolled: 10,
    capacity: 18,
    status: '可报名',
    skills: ['Java', 'Spring Cloud', 'Docker', 'Kubernetes'],
    content: [
      '微服务架构设计',
      '实现服务注册与发现',
      '配置中心和服务网关',
      '容器化部署和运维'
    ],
    gains: [
      '掌握微服务架构',
      '学习分布式系统设计',
      '了解容器化技术',
      '获得1学分'
    ]
  }
])

const filteredProjects = computed(() => {
  // 根据显示模式选择数据源
  let result = showMyProjects.value ? myProjects.value : allProjects.value

  // 只有在显示全部项目时才进行筛选
  if (!showMyProjects.value) {
    if (filterForm.value.type) {
      result = result.filter(p => p.type === filterForm.value.type)
    }

    if (filterForm.value.difficulty) {
      result = result.filter(p => p.difficulty === filterForm.value.difficulty)
    }

    if (filterForm.value.status) {
      result = result.filter(p => p.status === filterForm.value.status)
    }

    if (filterForm.value.keyword) {
      const keyword = filterForm.value.keyword.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(keyword))
    }
  } else {
    // 我的项目模式下，只支持按关键词搜索
    if (filterForm.value.keyword) {
      const keyword = filterForm.value.keyword.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(keyword))
    }
  }

  return result
})

const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  filterForm.value = {
    type: '',
    difficulty: '',
    status: '',
    keyword: ''
  }
  currentPage.value = 1
}

// 显示全部项目
const handleShowAllProjects = async () => {
  console.log('📋 显示全部项目')
  showMyProjects.value = false
  currentPage.value = 1
  // 重置筛选条件
  filterForm.value = {
    type: '',
    difficulty: '',
    status: '',
    keyword: ''
  }
  
  // 加载全部项目数据
  await refreshProjectData()
}

// 显示我的项目
const handleShowMyProjects = async () => {
  console.log('👤 显示我的项目')
  showMyProjects.value = true
  currentPage.value = 1
  
  // 加载我的项目数据
  await loadMyProjects()
}

// 加载我的项目
const loadMyProjects = async () => {
  try {
    loading.value = true
    console.log('🔄 正在加载我的项目...')
    
    const response = await projectApi.getMyProjects()
    console.log('📋 我的项目响应:', response)
    
    let projects = []
    if (response && response.data) {
      // 根据数据格式处理
      if (Array.isArray(response.data)) {
        projects = response.data
      } else if (response.data.list && Array.isArray(response.data.list)) {
        projects = response.data.list
      } else if (response.data.projects && Array.isArray(response.data.projects)) {
        projects = response.data.projects
      } else {
        console.warn('⚠️ 无法识别的数据格式')
        projects = []
      }
      
      // 为每个已参与的项目获取进度信息
      console.log('📈 开始获取项目进度信息...')
      const projectsWithProgress = await Promise.allSettled(
        projects.map(async (project) => {
          try {
            console.log(`🔍 获取项目 ${project.id} 的进度...`)
            const progressResponse = await projectApi.getProjectProgress(project.id)
            console.log(`📊 项目 ${project.id} 进度响应:`, progressResponse)
            
            // 添加进度信息到项目对象
            return {
              ...project,
              progress: progressResponse?.data || progressResponse || null
            }
          } catch (error) {
            console.warn(`⚠️ 获取项目 ${project.id} 进度失败:`, error)
            // 即使获取进度失败，也返回项目信息，只是进度为null
            return {
              ...project,
              progress: null
            }
          }
        })
      )
      
      // 处理结果，只保留成功的结果
      myProjects.value = projectsWithProgress
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
      
      console.log(`✅ 成功加载 ${myProjects.value.length} 个我的项目（包含进度信息）`)
      ElMessage.success(`成功加载 ${myProjects.value.length} 个我的项目`)
    } else {
      console.log('📝 暂无我的项目数据')
      myProjects.value = []
      ElMessage.info('暂无我的项目')
    }
  } catch (error) {
    console.error('❌ 加载我的项目失败:', error)
    myProjects.value = []
    ElMessage.error('加载我的项目失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    // 先从localStorage获取
    const savedUserInfo = localStorage.getItem('userInfo')
    let userInfo = null
    
    if (savedUserInfo) {
      try {
        userInfo = JSON.parse(savedUserInfo)
        console.log('👤 从localStorage获取用户信息:', userInfo)
      } catch (error) {
        console.warn('⚠️ 解析用户信息失败:', error)
      }
    }
    
    // 尝试从API获取最新用户信息
    try {
      const response = await userApi.getUserInfo()
      if (response && response.data) {
        userInfo = response.data
        console.log('✅ 从API获取最新用户信息:', userInfo)
        // 更新localStorage
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
    } catch (apiError) {
      console.log('📝 API获取用户信息失败，使用缓存数据:', apiError.message)
    }
    
    return userInfo
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    return null
  }
}

const handleApply = async (project) => {
  selectedProject.value = project
  
  // 获取最新用户信息
  const userInfo = await getUserInfo()
  
  // 设置表单默认值
  applyForm.value = {
    name: userInfo?.name || userInfo?.username || '',
    studentId: userInfo?.studentId || '',
    phone: userInfo?.phone || userInfo?.mobile || '', // 支持多种手机号字段名
    email: userInfo?.email || '',
    introduction: ''
  }
  
  console.log('📋 报名表单默认值:', applyForm.value)
  
  // 如果手机号为空，提示用户填写
  if (!applyForm.value.phone) {
    console.log('📱 手机号字段为空，需要用户手动填写')
  }
  
  applyDialogVisible.value = true
}

const handleSubmitApply = async () => {
  if (!applyFormRef.value || !selectedProject.value) {
    ElMessage.error('请选择要报名的项目')
    return
  }

  try {
    // 表单验证
    console.log('📋 开始表单验证...')
    const formValid = await applyFormRef.value.validate().catch(err => {
      console.warn('⚠️ 表单验证失败:', err)
      return false
    })
    
    if (!formValid) {
      ElMessage.error('请检查并完善报名信息')
      return
    }

    // 项目状态验证
    if (!validateProjectApplication()) {
      return
    }

    // 准备报名数据
    const applicationData = prepareApplicationData()
    console.log('📝 提交项目报名申请:')
    console.log('   项目ID:', selectedProject.value.id)
    console.log('   项目名称:', selectedProject.value.name)
    console.log('   申请数据:', applicationData)

    // 发送报名请求
    const response = await projectApi.applyProject(selectedProject.value.id, applicationData)
    console.log('📝 项目报名响应:', response)

    // 处理响应结果
    if (handleApplicationResponse(response)) {
      // 报名成功处理
      handleApplicationSuccess()
    }

  } catch (error) {
    console.error('❌ 项目报名失败:', error)
    console.error('错误详情:', error.response?.data)
    handleApplicationError(error)
  }
}

const handleViewDetail = (project) => {
  selectedProjectDetail.value = project
  detailDialogVisible.value = true
}

const handleApplyFromDetail = () => {
  if (selectedProjectDetail.value) {
    handleApply(selectedProjectDetail.value)
    detailDialogVisible.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const getDifficultyColor = (difficulty) => {
  const map = {
    '初级': themeColors.difficultyBeginner,
    '中级': themeColors.difficultyIntermediate,
    '高级': themeColors.difficultyAdvanced
  }
  return map[difficulty] || themeColors.infoColor
}

const getStatusType = (status) => {
  const map = {
    '可报名': 'success',
    '进行中': 'warning',
    '已结束': 'info'
  }
  return map[status] || 'info'
}

// 验证项目报名条件
const validateProjectApplication = () => {
  const project = selectedProject.value
  
  if (!project) {
    ElMessage.error('未选择项目')
    return false
  }

  // 检查项目状态
  if (project.status !== '可报名') {
    const statusMap = {
      '进行中': '该项目已开始，无法报名',
      '已结束': '该项目已结束，无法报名',
      '已满员': '该项目报名人数已满'
    }
    ElMessage.error(statusMap[project.status] || '项目状态不允许报名')
    return false
  }

  // 检查报名人数
  if (project.enrolled >= project.capacity) {
    ElMessage.error('该项目报名人数已满，请选择其他项目')
    return false
  }

  // 检查截止时间
  if (project.deadline) {
    const deadline = new Date(project.deadline)
    const now = new Date()
    if (now > deadline) {
      ElMessage.error('报名已截止，请选择其他项目')
      return false
    }
  }

  console.log('✅ 项目报名条件验证通过')
  return true
}

// 准备报名数据
const prepareApplicationData = () => {
  const formData = {
    // 基本信息
    name: applyForm.value.name.trim(),
    studentId: applyForm.value.studentId.trim(),
    phone: applyForm.value.phone.trim(),
    email: applyForm.value.email.trim().toLowerCase(),
    introduction: applyForm.value.introduction.trim(),
    
    // 项目信息
    projectId: selectedProject.value.id,
    projectName: selectedProject.value.name,
    company: selectedProject.value.company,
    type: selectedProject.value.type,
    
    // 时间信息
    applicationTime: new Date().toISOString(),
    clientInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    }
  }

  return formData
}

// 处理报名响应
const handleApplicationResponse = (response) => {
  if (!response) {
    ElMessage.error('服务器无响应，请稍后重试')
    return false
  }

  // 检查响应格式
  if (typeof response === 'object' && 'code' in response) {
    console.log('🏷️ 标准格式响应检测到')
    
    const successCodes = [200, 0, 201, 204]
    if (successCodes.includes(response.code)) {
      console.log('✅ 报名成功')
      return true
    } else {
      const errorMessage = response.message || '报名失败，请稍后重试'
      console.log(`❌ 报名失败: ${errorMessage}`)
      ElMessage.error(errorMessage)
      return false
    }
  } else {
    // 非标准格式，假设成功
    console.log('📄 非标准响应格式，假设成功')
    return true
  }
}

// 处理报名成功
const handleApplicationSuccess = () => {
  console.log('🎉 处理报名成功后续流程...')
  
  // 显示成功消息
  ElMessage({
    message: '🎉 报名成功！请等待审核',
    type: 'success',
    duration: 5000,
    showClose: true
  })

  // 关闭对话框
  applyDialogVisible.value = false
  
  // 重置表单
  applyForm.value = {
    name: '',
    studentId: '',
    phone: '',
    email: '',
    introduction: ''
  }
  
  if (applyFormRef.value) {
    applyFormRef.value.clearValidate()
  }

  // 更新项目报名人数（本地乐观更新）
  if (selectedProject.value) {
    selectedProject.value.enrolled++
  }

  // 刷新数据和统计信息
  refreshProjectData()
  fetchProjectStats() // 重新获取统计数据
}

// 处理报名错误
const handleApplicationError = (error) => {
  console.error('❌ 报名错误详情:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data
  })

  // 网络错误处理
  if (!error.response) {
    ElMessage.error('网络连接失败，请检查网络后重试')
    return
  }

  // HTTP状态码处理
  const status = error.response.status
  const data = error.response.data

  let errorMessage = '报名失败，请稍后重试'

  switch (status) {
    case 400:
      errorMessage = data?.message || '报名信息格式错误'
      break
    case 401:
      errorMessage = '请先登录'
      break
    case 403:
      errorMessage = data?.message || '权限不足或项目不可报名'
      break
    case 404:
      errorMessage = '项目不存在，请刷新页面后重试'
      break
    case 409:
      errorMessage = data?.message || '您已经报名过该项目'
      break
    case 422:
      errorMessage = data?.message || '报名信息验证失败'
      break
    case 500:
      errorMessage = '服务器内部错误，请稍后重试'
      break
    default:
      errorMessage = data?.message || `报名失败 (错误码: ${status})`
  }

  ElMessage.error(errorMessage)
}

// 验证项目删除条件
const validateProjectDeletion = (project) => {
  console.log('🔍 验证项目删除条件:', project)
  
  if (!project) {
    ElMessage.error('未选择项目')
    return false
  }

  // 检查项目状态 - 某些状态下可能不允许删除报名
  const deletableStatuses = ['可报名', '申请中', '已报名']
  if (project.status && !deletableStatuses.includes(project.status)) {
    const statusMap = {
      '进行中': '项目已开始，无法删除报名',
      '已结束': '项目已结束，无法删除报名',
      '已完成': '项目已完成，无法删除报名'
    }
    const message = statusMap[project.status] || `项目状态为"${project.status}"，无法删除报名`
    ElMessage.warning(message)
    return false
  }

  console.log('✅ 项目删除条件验证通过')
  return true
}

// 删除项目报名
// 刷新单个项目的进度
const handleRefreshProgress = async (project) => {
  try {
    refreshingProgress.value = true
    refreshingProjectId.value = project.id
    
    console.log(`🔄 正在刷新项目进度: ${project.name} (ID: ${project.id})`)
    
    const progressResponse = await projectApi.getProjectProgress(project.id)
    console.log(`📊 项目 ${project.id} 新的进度响应:`, progressResponse)
    
    // 更新项目中对应的进度信息
    const projectIndex = myProjects.value.findIndex(p => p.id === project.id)
    if (projectIndex !== -1) {
      myProjects.value[projectIndex].progress = progressResponse?.data || progressResponse || null
      console.log(`✅ 项目 ${project.id} 进度更新成功`)
    }
    
    ElMessage.success('项目进度刷新成功')
  } catch (error) {
    console.error(`❌ 刷新项目 ${project.id} 进度失败:`, error)
    ElMessage.error('刷新项目进度失败：' + (error.message || '未知错误'))
  } finally {
    refreshingProgress.value = false
    refreshingProjectId.value = null
  }
}

const handleDeleteProject = async (project) => {
  try {
    // 检查项目状态是否允许删除报名
    if (!validateProjectDeletion(project)) {
      return
    }

    // 确认对话框
    await ElMessageBox.confirm(
      `确定要删除报名「${project.name}」吗？删除后将无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 开始删除
    deleting.value = true
    deletingProjectId.value = project.id

    console.log(`🗑️ 正在删除项目报名: ${project.name} (ID: ${project.id})`)
    console.log('📋 项目完整信息:', project)
    
    // 检查当前用户信息
    try {
      const userInfo = await getUserInfo()
      console.log('👤 当前用户信息:', userInfo)
    } catch (userError) {
      console.warn('⚠️ 获取用户信息失败:', userError.message)
    }

    // 检查项目状态和属性
    console.log('🔍 删除前检查:', {
      projectId: project.id,
      projectName: project.name,
      projectStatus: project.status,
      enrolled: project.enrolled,
      capacity: project.capacity,
      canDelete: validateProjectDeletion(project),
      // 检查可能的时间相关字段
      startTime: project.startTime || project.startDate,
      endTime: project.endTime || project.endDate,
      applicationTime: project.applicationTime || project.enrollmentTime,
      currentTime: new Date().toISOString()
    })

    // 调用删除API
    const response = await projectApi.cancelProjectApplication(project.id)
    console.log('🗑️ 删除项目报名响应:', response)
    console.log('📊 响应详细信息:', {
      code: response?.code,
      message: response?.message,
      data: response?.data,
      errors: response?.errors
    })

    // 处理删除成功
    ElMessage({
      message: '✅ 删除报名成功！',
      type: 'success',
      duration: 3000
    })

    // 从我的项目列表中移除该项目
    const index = myProjects.value.findIndex(p => p.id === project.id)
    if (index > -1) {
      myProjects.value.splice(index, 1)
    }

    // 如果当前是在全部项目模式下，更新对应项目的报名人数
    if (!showMyProjects.value) {
      const allProjectIndex = allProjects.value.findIndex(p => p.id === project.id)
      if (allProjectIndex > -1) {
        allProjects.value[allProjectIndex].enrolled = Math.max(0, allProjects.value[allProjectIndex].enrolled - 1)
      }
    }

    // 刷新统计数据
    fetchProjectStats()

  } catch (error) {
    // 用户取消删除不显示错误消息
    if (error === 'cancel') {
      console.log('👤 用户取消删除操作')
      return
    }

    console.error('❌ 删除项目报名失败:', error)
    console.error('错误详情:', error.response?.data)

    // 使用调试工具分析错误
    if (window.debug400Error) {
      window.debug400Error.logErrorDetails(error, project)
      window.debug400Error.analyzePossibleCauses(project)
      window.debug400Error.generateDebugReport(error, project)
      
      // 尝试自动修复
      if (error.response?.status === 400) {
        window.debug400Error.attemptFixes(project)
      }
    }

    // 网络错误处理
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络后重试')
      return
    }

    // HTTP状态码处理
    const status = error.response.status
    const data = error.response.data

    let errorMessage = '删除报名失败，请稍后重试'
    let shouldRefresh = false

    switch (status) {
      case 400:
        // 尝试从多个来源获取错误信息
        let errorDetails = []
        
        // 从主message获取
        if (data?.message) {
          errorDetails.push(data.message)
        }
        
        // 从errors对象获取详细信息
        if (data?.errors && typeof data.errors === 'object') {
          Object.entries(data.errors).forEach(([key, value]) => {
            if (value && typeof value === 'string') {
              errorDetails.push(`${key}: ${value}`)
            } else if (value && value.message) {
              errorDetails.push(`${key}: ${value.message}`)
            }
          })
        }
        
        // 合并错误信息
        errorMessage = errorDetails.join('\n') || '请求参数错误'
        
        // 根据错误内容提供针对性建议
        const errorText = errorMessage.toLowerCase()
        if (errorText.includes('已开始') || errorText.includes('进行中') || errorText.includes('started')) {
          errorMessage += '\n\n💡 项目已开始，请联系管理员处理'
        } else if (errorText.includes('已结束') || errorText.includes('已完成') || errorText.includes('ended') || errorText.includes('completed')) {
          errorMessage += '\n\n💡 项目已结束，无法删除报名记录'
        } else if (errorText.includes('不存在') || errorText.includes('无效') || errorText.includes('not found') || errorText.includes('invalid')) {
          errorMessage += '\n\n💡 建议刷新页面后重试'
          shouldRefresh = true
        } else if (errorText.includes('已满') || errorText.includes('full') || errorText.includes('capacity')) {
          errorMessage += '\n\n💡 项目人数已满，请联系管理员'
        } else if (errorText.includes('重复') || errorText.includes('duplicate') || errorText.includes('already')) {
          errorMessage += '\n\n💡 操作重复，请刷新页面查看最新状态'
          shouldRefresh = true
        } else {
          errorMessage += '\n\n💡 请检查项目状态或联系技术支持'
        }
        
        console.log('🔍 400错误详细信息:', {
          message: data?.message,
          errors: data?.errors,
          fullData: data,
          projectId: project.id,
          projectStatus: project.status,
          enrollmentInfo: {
            enrolled: project.enrolled,
            capacity: project.capacity,
            applicationTime: project.applicationTime,
            applicationStatus: project.applicationStatus
          }
        })
        
        // 尝试解析errors对象的具体内容
        if (data?.errors && typeof data.errors === 'object') {
          console.log('🔍 Errors对象详情:', Object.keys(data.errors))
          Object.entries(data.errors).forEach(([key, value]) => {
            console.log(`   ${key}:`, value)
          })
        }
        break
      case 401:
        errorMessage = '登录已过期，请重新登录后重试'
        break
      case 403:
        errorMessage = data?.message || '权限不足，无法删除该报名\n\n💡 请确认您有权限删除此项目的报名'
        break
      case 404:
        errorMessage = '项目报名不存在，请刷新页面后重试\n\n💡 该报名可能已被删除'
        shouldRefresh = true
        break
      case 409:
        errorMessage = data?.message || '项目状态不允许删除报名\n\n💡 项目可能已开始或结束'
        break
      case 500:
        errorMessage = '服务器内部错误，请稍后重试\n\n💡 如问题持续，请联系技术支持'
        break
      default:
        errorMessage = `${data?.message || data?.errors?.message || `删除失败 (错误码: ${status})`}\n\n💡 请稍后重试或联系技术支持`
    }

    // 显示错误消息
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
      showClose: true
    })

    // 如果需要刷新页面，给出提示
    if (shouldRefresh) {
      setTimeout(() => {
        ElMessageBox.confirm(
          '检测到数据可能已过期，是否刷新页面获取最新数据？',
          '刷新数据',
          {
            confirmButtonText: '刷新页面',
            cancelButtonText: '稍后处理',
            type: 'info'
          }
        ).then(() => {
          window.location.reload()
        }).catch(() => {
          // 用户选择稍后处理
        })
      }, 1000)
    }

    return // 避免重复显示错误消息

  } finally {
    deleting.value = false
    deletingProjectId.value = null
  }
}

// 获取项目统计数据
const fetchProjectStats = async () => {
  try {
    console.log('📊 获取项目统计数据...')
    const response = await projectApi.getProjectStats()
    
    if (response && response.data) {
      console.log('✅ 统计数据获取成功:', response.data)
      updateStatistics(response.data)
    } else {
      console.log('📝 后端暂无统计数据，使用本地计算')
      calculateLocalStats()
    }
  } catch (error) {
    console.warn('⚠️ 获取统计数据失败，使用本地计算:', error)
    calculateLocalStats()
  }
}

// 更新统计数据
const updateStatistics = (data) => {
  const statsData = data.data || data // 兼容不同的数据格式
  
  statistics.value[0].value = statsData.availableProjects || 0
  statistics.value[1].value = statsData.appliedProjects || 0
  statistics.value[2].value = statsData.completedProjects || 0
  statistics.value[3].value = statsData.creditsEarned || 0
  
  console.log('📊 统计数据已更新:', statistics.value)
}

// 本地计算统计数据（作为备选方案）
const calculateLocalStats = () => {
  // 基于当前项目数据计算统计信息
  // 注意：如果使用的是 getMyProjects，则数据本身就是用户相关的
  
  const availableProjects = allProjects.value.filter(p => p.status === '可报名').length
  const appliedProjects = allProjects.value.filter(p => 
    p.status === '已报名' || p.status === '申请中' || p.applied === true
  ).length
  const completedProjects = allProjects.value.filter(p => p.status === '已结束' || p.completed === true).length
  const inProgressProjects = allProjects.value.filter(p => p.status === '进行中').length
  
  // 计算学分（假设每个完成的项目获得对应的学分）
  const creditsEarned = allProjects.value
    .filter(p => p.status === '已结束' || p.completed === true)
    .reduce((total, project) => total + (project.credits || 1), 0)
  
  // 更新统计显示
  statistics.value[0].value = availableProjects.toString()
  statistics.value[1].value = appliedProjects.toString() 
  statistics.value[2].value = completedProjects.toString()
  statistics.value[3].value = creditsEarned.toString()
  
  console.log('📊 本地统计数据计算完成:', {
    可报名项目: availableProjects,
    已报名项目: appliedProjects,
    已完成项目: completedProjects,
    进行中项目: inProgressProjects,
    获得学分: creditsEarned,
    总项目数: allProjects.value.length
  })
}

// 刷新项目数据
const refreshProjectData = async () => {
  try {
    console.log('🔄 正在刷新项目数据...')
    
    let response = null
    let dataSource = ''
    
    if (showMyProjects.value) {
      // 我的项目模式
      console.log('🎯 获取我的项目列表...')
      response = await projectApi.getMyProjects()
      dataSource = 'my-projects'
      
      if (response && response.data) {
        // 更新我的项目数据
        if (Array.isArray(response.data)) {
          myProjects.value = response.data
        } else if (response.data.list && Array.isArray(response.data.list)) {
          myProjects.value = response.data.list
        } else if (response.data.projects && Array.isArray(response.data.projects)) {
          myProjects.value = response.data.projects
        } else {
          console.warn('⚠️ 无法识别我的项目数据格式')
          myProjects.value = []
        }
        console.log(`✅ 成功加载 ${myProjects.value.length} 个我的项目`)
      } else {
        console.log('📝 暂无我的项目数据')
        myProjects.value = []
      }
    } else {
      // 全部项目模式
      console.log('🎯 获取全部项目列表...')
      response = await projectApi.getProjects()
      dataSource = 'all-projects'
      
      if (response && response.data) {
        // 更新全部项目数据
        if (Array.isArray(response.data)) {
          allProjects.value = response.data
        } else if (response.data.list && Array.isArray(response.data.list)) {
          allProjects.value = response.data.list
        } else if (response.data.projects && Array.isArray(response.data.projects)) {
          allProjects.value = response.data.projects
        } else {
          console.warn('⚠️ 无法识别全部项目数据格式')
          allProjects.value = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
        }
        console.log(`✅ 成功加载 ${allProjects.value.length} 个全部项目`)
      } else {
        console.log('📝 后端暂无全部项目数据，继续使用本地mock数据')
      }
    }
    
    if (response && response.data) {
      console.log(`✅ 项目数据刷新成功 (数据源: ${dataSource})`)
      console.log('📊 返回的数据结构:', response.data)
    }
  } catch (error) {
    console.warn('⚠️ 刷新项目数据失败，继续使用本地数据:', error)
    // 即使刷新失败也不影响用户体验，继续使用本地数据
  }
}

// 初始化数据
const initializeData = async () => {
  await Promise.all([
    fetchProjectStats(), // 获取统计数据
    refreshProjectData() // 刷新项目数据
  ])
}

// 组件挂载时初始化数据
onMounted(() => {
  initializeData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.project-training-container {
  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: $text-primary;
    }

    .page-desc {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;

      .el-button {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      border: none;

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: $text-primary;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;
    border: none;

    .filter-form {
      margin: 0;
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .project-card {
      border: none;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .project-badge {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
      }

      .project-content {
        .project-name {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: $text-primary;
        }

        .project-desc {
          font-size: 14px;
          color: $text-regular;
          line-height: 1.6;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-info {
          margin-bottom: 16px;
          padding: 12px;
          background: $bg-color;
          border-radius: 8px;

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }

            .info-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              color: $text-regular;
              flex: 1;

              .el-icon {
                color: $text-secondary;
              }
            }
          }
        }

        .project-skills {
          margin-bottom: 16px;
          padding-top: 16px;
          border-top: 1px solid $border-color;

          .skills-label {
            font-size: 13px;
            color: $text-secondary;
            margin-right: 8px;
          }

          .skill-tag {
            margin-right: 6px;
            margin-bottom: 6px;
          }
        }

        .project-progress {
          margin-bottom: 16px;
          padding: 12px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .progress-label {
              font-size: 13px;
              color: $text-secondary;
            }

            .progress-text {
              font-size: 14px;
              font-weight: 500;
              color: $primary-color;
            }
          }

          .progress-bar {
            margin-bottom: 8px;
          }

          .progress-description {
            font-size: 12px;
            color: $text-secondary;
            line-height: 1.4;
          }
        }

        .project-footer {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }

  .project-detail {
    :deep(.el-descriptions__label) {
      font-weight: 600;
    }

    .project-content-list {
      margin: 0;
      padding-left: 20px;
      color: $text-regular;
      line-height: 1.8;

      li {
        margin-bottom: 8px;
      }
    }

    .skill-tag {
      margin-right: 6px;
      margin-bottom: 6px;
    }
  }
}

@media (max-width: 768px) {
  .project-training-container {
    .page-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: center;

        .el-button {
          flex: 1;
        }
      }
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
