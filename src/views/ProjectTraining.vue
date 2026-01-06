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
      <el-col :xs="24" :sm="12" :md="4" :lg="4" :xl="4" v-for="stat in statistics" :key="stat.label">
        <el-card 
          class="stat-card" 
          :class="{ 'stat-card-clickable': isStatClickable(stat.label) }"
          shadow="hover" 
          @click="handleStatCardClick(stat)"
        >
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24">
                <Collection v-if="stat.icon === 'Collection'" />
                <Briefcase v-else-if="stat.icon === 'Briefcase'" />
                <OfficeBuilding v-else-if="stat.icon === 'OfficeBuilding'" />
                <TrendCharts v-else-if="stat.icon === 'TrendCharts'" />
                <DataAnalysis v-else-if="stat.icon === 'DataAnalysis'" />
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

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
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
            <template v-if="!showMyProjects">
              <!-- 全部项目模式的状态选项 -->
              <el-option label="可报名" value="可报名" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已结束" value="已结束" />
            </template>
            <template v-else>
              <!-- 我的项目模式的状态选项 -->
              <el-option label="待审核" value="待审核" />
              <el-option label="已通过" value="已通过" />
              <el-option label="已拒绝" value="已拒绝" />
              <el-option label="运行中" value="运行中" />
              <el-option label="已完成" value="已完成" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            :placeholder="showMyProjects ? '搜索我的项目' : '搜索项目名称'"
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
                <el-icon><Trophy /></el-icon>
                <span>{{ project.commissionCoins || project.credits || 0 }}佣金币</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ project.startDate }}</span>
              </div>
            </div>
            <div class="info-row" v-if="showMyProjects">
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>申请状态: {{ project.applicationStatus || '未知' }}</span>
              </div>
              <div class="info-item" v-if="project.participationStatus">
                <el-icon><TrendCharts /></el-icon>
                <span>参与状态: {{ project.participationStatus }}</span>
              </div>
            </div>

            <div class="info-row" v-if="!showMyProjects">
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>{{ project.duration }}周</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ project.enrolled }}/{{ project.capacity }}人</span>
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
          <div v-if="showMyProjects && (project.progress || project.participationStatus === '运行中')" class="project-progress">
            <div class="progress-header">
              <span class="progress-label">项目进度：</span>
              <span class="progress-text">{{ project.progress?.percentage || project.progress || 0 }}%</span>
            </div>
            <el-progress 
              :percentage="project.progress?.percentage || project.progress || 0" 
              :status="getProgressStatus(project.progress?.percentage || project.progress || 0)"
              :show-text="false"
              class="progress-bar"
            />
            <div v-if="project.progress?.description" class="progress-description">
              {{ project.progress.description }}
            </div>
            <div v-else-if="project.participationStatus === '运行中'" class="progress-description">
              项目正在进行中...
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
              @click="handleCancelApplication(project)"
              v-if="showMyProjects && (project.applicationStatus === '待审核' || project.applicationStatus === '申请中')"
              size="small"
              :loading="cancellingApplication && cancellingProjectId === project.id"
            >
              <el-icon><CircleClose /></el-icon>
              取消报名
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
          <el-descriptions-item label="可获得佣金币">
            {{ selectedProjectDetail.commissionCoins || selectedProjectDetail.credits || 0 }}佣金币
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
          v-if="!showMyProjects"
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
  CircleClose,
  Briefcase,
  OfficeBuilding,
  Clock,
  User,
  Trophy,
  Calendar,
  Collection,
  TrendCharts,
  DataAnalysis,
  Refresh
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'
import { projectApi, userApi } from '@/api'
// import '@/utils/debug400Error.js' // 已移除400错误调试工具
import { BASE_URL } from '@/config/api.js'

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

const refreshingProgress = ref(false)
const refreshingProjectId = ref(null)

const cancellingApplication = ref(false)
const cancellingProjectId = ref(null)

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
    label: '可报名',
    value: '0',
    icon: 'Collection',
    color: themeColors.gradientPrimary
  },
  {
    label: '已报名',
    value: '0',
    icon: 'Collection',
    color: '#ffcccc'
  },
  {
    label: '正在进行的项目',
    value: '0',
    icon: 'TrendCharts',
    color: themeColors.gradientBlue
  },
  {
    label: '获得佣金币',
    value: '0',
    icon: 'DataAnalysis',
    color: themeColors.gradientGreen
  }
])

const allProjects = ref([])

// 当前筛选模式
const currentFilterMode = ref('all')

const filteredProjects = computed(() => {
  let result = []
  
  console.log(`🔍 筛选项目 - 模式: ${showMyProjects.value ? '我的项目' : '全部项目'}, 当前筛选模式: ${currentFilterMode.value}`)

  // 根据不同的筛选模式处理数据源
  if (currentFilterMode.value === '可报名') {
    // 可报名模式：筛选出用户没有报名过的项目
    const enrolledProjectIds = myProjects.value.map(p => p.id)
    result = allProjects.value.filter(project => 
      project.status === '可报名' && 
      project.enrolled < project.capacity &&
      !enrolledProjectIds.includes(project.id)
    )
  } else {
    // 其他模式：根据显示模式选择数据源
    result = showMyProjects.value ? myProjects.value : allProjects.value
  }

  // 只有在显示全部项目且不是可报名模式时才进行完整筛选
  if (!showMyProjects.value && currentFilterMode.value !== '可报名') {
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
      result = result.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.company.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword)
      )
    }
  } else if (showMyProjects.value) {
    // 我的项目模式下的筛选
    if (filterForm.value.type) {
      result = result.filter(p => p.type === filterForm.value.type)
    }

    if (filterForm.value.difficulty) {
      result = result.filter(p => p.difficulty === filterForm.value.difficulty)
    }

    if (filterForm.value.status) {
      // 我的项目状态下筛选
      result = result.filter(p => {
        // 检查申请状态
        if (p.applicationStatus === filterForm.value.status) {
          return true
        }
        // 检查参与状态
        if (p.participationStatus === filterForm.value.status) {
          return true
        }
        // 检查映射后的状态
        if (p.status === filterForm.value.status) {
          return true
        }
        return false
      })
    }

    if (filterForm.value.keyword) {
      const keyword = filterForm.value.keyword.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.company.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.projectName?.toLowerCase().includes(keyword)
      )
    }
  }

  console.log(`✨ 筛选结果: ${result.length} 个项目`)
  return result
})

// 判断统计卡片是否可点击
const isStatClickable = (label) => {
  const clickableLabels = ['可报名', '已报名', '正在进行的项目']
  return clickableLabels.includes(label)
}

// 处理统计卡片点击
const handleStatCardClick = (stat) => {
  if (!isStatClickable(stat.label)) {
    return
  }
  
  console.log('📊 点击统计卡片:', stat.label)
  
  // 根据点击的统计卡片设置不同的逻辑
  if (stat.label === '可报名') {
    // 可报名：显示全部项目模式，筛选出用户没有报名过的项目
    showMyProjects.value = false
    currentFilterMode.value = '可报名'
    
    // 重置筛选条件
    filterForm.value.type = ''
    filterForm.value.difficulty = ''
    filterForm.value.status = ''
    filterForm.value.keyword = ''
    currentPage.value = 1
    
    // 加载全部项目数据
    refreshProjectData()
    
  } else {
    // 已报名和正在进行的项目：切换到我的项目模式
    showMyProjects.value = true
    currentFilterMode.value = stat.label
    
    // 根据点击的统计卡片设置筛选条件
    if (stat.label === '已报名') {
      filterForm.value.status = '待审核'
    } else if (stat.label === '正在进行的项目') {
      filterForm.value.status = '已通过'
    }
    
    // 重置其他筛选条件
    filterForm.value.type = ''
    filterForm.value.difficulty = ''
    filterForm.value.keyword = ''
    currentPage.value = 1
    
    // 加载我的项目数据
    loadMyProjects()
  }
}

const handleSearch = () => {
  currentPage.value = 1
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
  currentFilterMode.value = 'all'
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
  currentFilterMode.value = 'all'
  currentPage.value = 1
  
  // 加载我的项目数据
  await loadMyProjects()
}

// 加载我的项目
const loadMyProjects = async () => {
  try {
    loading.value = true
    console.log('🔄 正在加载我的项目...')
    console.log('📡 请求URL:', `${BASE_URL}/projects/my-projects`)
    
    const response = await projectApi.getMyProjects()
    console.log('📋 我的项目响应:', response)
    
    let projects = []
    if (response && response.code === 200 && response.data) {
      // 根据API返回的数据格式处理
      if (response.data.list && Array.isArray(response.data.list)) {
        projects = response.data.list
      } else if (Array.isArray(response.data)) {
        projects = response.data
      } else {
        console.warn('⚠️ 无法识别的数据格式')
        projects = []
      }
      
      // 标准化项目数据格式
      projects = projects.map(project => ({
        // 基础信息
        id: project.projectId,
        name: project.projectName || project.name,
        description: project.description || '暂无描述',
        
        // 项目详情
        company: project.company || '未知企业',
        type: project.type || '未分类',
        difficulty: project.difficulty || '中级',
        credits: project.credits || 0,
        commissionCoins: project.commissionCoins || project.credits || 0,
        startDate: project.startDate || '未知时间',
        
        // 状态信息
        status: mapApplicationStatus(project.applicationStatus, project.participationStatus),
        applicationStatus: project.applicationStatus,
        participationStatus: project.participationStatus,
        
        // 申请相关ID - 用于取消报名
        applicationId:  project.id, // 优先使用applicationId
        
        // 进度信息 - 已参与的项目才有进度
        progress: project.participationStatus === '运行中' ? {
          percentage: project.progress || 0,
          status: project.progress >= 100 ? 'success' : 'normal',
          description: `当前进度: ${project.progress || 0}%`
        } : null,
        
        // 其他信息
        duration: 12, // 默认周数
        enrolled: 1, // 我的项目报名人数
        capacity: 20, // 默认容量
        applicationDate: project.applicationDate,
        skills: getDefaultSkills(project.type),
        
        // 原始数据保留
        _raw: project
      }))
      
      // 为已参与的项目获取详细进度信息
      const activeProjects = projects.filter(p => p.participationStatus === '运行中')
      if (activeProjects.length > 0) {
        console.log('📈 开始获取活跃项目的进度信息...')
        
        const projectsWithProgress = await Promise.allSettled(
          activeProjects.map(async (project) => {
            try {
              console.log(`🔍 获取项目 ${project.id} 的进度...`)
              const progressResponse = await projectApi.getProjectProgress(project.id)
              console.log(`📊 项目 ${project.id} 进度响应:`, progressResponse)
              
              // 更新进度信息
              return {
                ...project,
                progress: progressResponse?.data || progressResponse || project.progress
              }
            } catch (error) {
              console.warn(`⚠️ 获取项目 ${project.id} 进度失败:`, error)
              return project // 保持原有进度信息
            }
          })
        )
        
        // 更新活跃项目的进度信息
        projectsWithProgress.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const projectIndex = projects.findIndex(p => p.id === result.value.id)
            if (projectIndex !== -1) {
              projects[projectIndex] = result.value
            }
          }
        })
      }
      
      myProjects.value = projects
      console.log(`✅ 成功加载 ${myProjects.value.length} 个我的项目（包含进度信息）`)
      
      // 显示详细信息
      myProjects.value.forEach((project, index) => {
        console.log(`\n📁 项目 ${index + 1} 详情:`)
        console.log(`  - ID: ${project.id}`)
        console.log(`  - 名称: ${project.name}`)
        console.log(`  - 企业: ${project.company}`)
        console.log(`  - 类型: ${project.type}`)
        console.log(`  - 难度: ${project.difficulty}`)
        console.log(`  - 学分: ${project.credits}`)
        console.log(`  - 申请状态: ${project.applicationStatus}`)
        console.log(`  - 参与状态: ${project.participationStatus}`)
        console.log(`  - 进度: ${project.progress ? project.progress.percentage + '%' : '无'}`)
      })
      
      // 更新统计数据
      updateMyProjectsStats(projects)
      
    } else {
      console.log('📝 响应格式异常或无数据')
      myProjects.value = []
      ElMessage.info('暂无我的项目数据')
    }
  } catch (error) {
    console.error('❌ 加载我的项目失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    
    // 根据错误类型给出具体提示
    let errorMessage = '加载我的项目失败'
    if (error.response?.status === 401) {
      errorMessage = '登录已过期，请重新登录'
    } else if (error.response?.status === 403) {
      errorMessage = '权限不足，无法获取项目信息'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器错误，请稍后重试'
    } else if (error.message) {
      errorMessage = `加载失败：${error.message}`
    }
    
    myProjects.value = []
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 映射申请状态到显示状态
const mapApplicationStatus = (applicationStatus, participationStatus) => {
  if (participationStatus === '运行中') {
    return '进行中'
  }
  
  switch (applicationStatus) {
    case '已通过':
      return '已通过'
    case '待审核':
      return '待审核'
    case '已拒绝':
      return '已拒绝'
    case '申请中':
      return '申请中'
    default:
      return '待审核'
  }
}

// 根据项目类型获取默认技能
const getDefaultSkills = (projectType) => {
  const skillMap = {
    'Web开发': ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
    '移动开发': ['React Native', 'JavaScript', 'Mobile'],
    '数据分析': ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
    '人工智能': ['Python', 'TensorFlow', 'Machine Learning'],
    '系统开发': ['Java', 'Spring Boot', 'Database'],
    '数据分析': ['Python', 'SQL', 'Excel', 'Tableau']
  }
  
  return skillMap[projectType] || ['通用技能']
}

// 更新我的项目统计数据
const updateMyProjectsStats = async (projects) => {
  const pendingProjects = projects.filter(p => 
    p.applicationStatus === '待审核'
  ).length
  
  const applyingProjects = projects.filter(p => 
    p.applicationStatus === '申请中'
  ).length
  
  // 已报名项目 = 只计算已通过审核的项目
  const appliedProjects = projects.filter(p => 
    p.applicationStatus === '已通过' || p.participationStatus === '运行中'
  ).length
  
  const activeProjects = projects.filter(p => 
    p.participationStatus === '运行中'
  ).length
  
  const completedProjects = projects.filter(p => 
    p.participationStatus === '已完成' || p.progress?.percentage >= 100
  ).length
  
  // 正在进行的项目 = 已通过审核但未完成的项目
  const ongoingProjects = projects.filter(p => 
    (p.applicationStatus === '已通过' || p.participationStatus === '运行中') && 
    p.participationStatus !== '已完成' && 
    (p.progress?.percentage || 0) < 100
  ).length
  
  const creditsEarned = projects
    .filter(p => p.participationStatus === '运行中' || p.participationStatus === '已完成')
    .reduce((total, project) => total + (project.commissionCoins || project.credits || 0), 0)
  
  // 获取可报名项目数量（从全部项目API）
  let availableProjects = '0'
  try {
    const allProjectsResponse = await projectApi.getProjects()
    if (allProjectsResponse && allProjectsResponse.data) {
      let allProjects = []
      if (Array.isArray(allProjectsResponse.data)) {
        allProjects = allProjectsResponse.data
      } else if (allProjectsResponse.data.list && Array.isArray(allProjectsResponse.data.list)) {
        allProjects = allProjectsResponse.data.list
      }
      
      // 统计可报名的项目
      availableProjects = allProjects.filter(p => 
        p.status === '可报名' && 
        p.enrolled < p.capacity
      ).length.toString()
      
      console.log(`📊 从全部项目获取到 ${availableProjects} 个可报名项目`)
    }
  } catch (error) {
    console.warn('⚠️ 获取可报名项目数量失败，使用本地计算:', error)
    // 如果API失败，使用当前数据计算
    availableProjects = allProjects.value.filter(p => 
      p.status === '可报名' && 
      p.enrolled < p.capacity
    ).length.toString()
  }
  
  // 更新统计信息，保持图标配置不变
  statistics.value[0] = {
    ...statistics.value[0],
    value: availableProjects.toString()      // 可报名项目
  }
  statistics.value[1] = {
    ...statistics.value[1],
    value: pendingProjects.toString()  // 待审核
  }
  statistics.value[2] = {
    ...statistics.value[2],
    value: ongoingProjects.toString()  // 正在进行的项目
  }
  statistics.value[3] = {
    ...statistics.value[3],
    value: creditsEarned.toString()  // 获得佣金币
  }
  
  console.log('📊 统计数据更新:', {
    可报名项目: availableProjects,
    已申请项目: appliedProjects,
    待审核: pendingProjects,
    正在进行的项目: ongoingProjects,
    已完成项目: completedProjects,
    获得佣金币: creditsEarned
  })
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
    '已结束': 'info',
    '待审核': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger',
    '申请中': 'info',
    '运行中': 'warning'
  }
  return map[status] || 'info'
}

// 获取进度条状态
const getProgressStatus = (percentage) => {
  if (percentage >= 100) return 'success'
  if (percentage >= 80) return 'warning'
  return 'normal'
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

// 取消项目报名
const handleCancelApplication = async (project) => {
  try {
    // 确认对话框
    await ElMessageBox.confirm(
      `确定要取消报名项目"${project.name}"吗？取消后将无法恢复。`,
      '确认取消报名',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留报名',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    cancellingApplication.value = true
    cancellingProjectId.value = project.id
    
    console.log(`❌ 正在取消项目报名: ${project.name}`)
    console.log(`📋 项目ID: ${project.id}`)
    console.log(`📋 申请ID: ${project.applicationId }`)
    
    let response
    
    // 暂时使用兼容方法，通过项目ID取消报名
    // 如果后端支持新的API端点，可以取消下面的注释
    /*
    if (project.applicationId && project.applicationId !== project.id) {
      console.log(`🎯 使用申请ID取消报名: ${project.applicationId}`)
      response = await projectApi.cancelApplication(project.id, project.applicationId)
    } else {
      console.log(`⚠️ 申请ID与项目ID相同或未找到，使用项目ID取消报名`)
    */
    console.log(`🎯 使用项目ID取消报名: ${project.id}`)
    response = await projectApi.cancelApplicationByProject(project.id)
    
    console.log(`✅ 取消报名响应:`, response)
    
    // 从我的项目列表中移除该项目
    const projectIndex = myProjects.value.findIndex(p => p.id === project.id)
    if (projectIndex !== -1) {
      myProjects.value.splice(projectIndex, 1)
      console.log(`✅ 项目 ${project.id} 已从列表中移除`)
    }
    
    // 更新统计数据
    updateMyProjectsStats(myProjects.value)
    
    // 刷新全部项目数据，确保该项目重新变为可报名状态
    await refreshProjectData()
    
    ElMessage({
      message: '✅ 取消报名成功',
      type: 'success',
      duration: 3000
    })
    
  } catch (error) {
    // 用户取消确认对话框
    if (error === 'cancel') {
      console.log('👤 用户取消了报名操作')
      return
    }
    
    console.error(`❌ 取消项目报名失败:`, error)
    
    // 处理不同类型的错误
    let errorMessage = '取消报名失败，请稍后重试'
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          break
        case 401:
          errorMessage = '登录已过期，请重新登录'
          break
        case 403:
          errorMessage = data?.message || '权限不足，无法取消报名'
          break
        case 404:
          errorMessage = '项目或申请不存在，请刷新页面后重试'
          break
        case 409:
          errorMessage = data?.message || '申请状态不允许取消'
          break
        case 500:
          errorMessage = '服务器内部错误，请稍后重试'
          break
        default:
          errorMessage = data?.message || `取消报名失败 (错误码: ${status})`
      }
    } else if (error.message) {
      errorMessage = `网络错误：${error.message}`
    }
    
    ElMessage.error(errorMessage)
  } finally {
    cancellingApplication.value = false
    cancellingProjectId.value = null
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
  
  // 确保图标配置不被覆盖
  statistics.value[0] = {
    ...statistics.value[0],
    value: (statsData.availableProjects || 0).toString()
  }
  statistics.value[1] = {
    ...statistics.value[1],
    value: (statsData.pendingProjects || 0).toString()
  }
  statistics.value[2] = {
    ...statistics.value[2],
    value: (statsData.ongoingProjects || 0).toString()
  }
  statistics.value[3] = {
    ...statistics.value[3],
    value: (statsData.commissionCoinsEarned || statsData.creditsEarned || 0).toString()
  }
  
  console.log('📊 统计数据已更新:', statistics.value)
}

// 本地计算统计数据（作为备选方案）
const calculateLocalStats = () => {
  // 基于当前项目数据计算统计信息
  
  const availableProjects = allProjects.value.filter(p => 
    p.status === '可报名' && 
    p.enrolled < p.capacity  // 确保还有名额
  ).length
  
  // 从我的项目数据中计算
  const pendingProjects = myProjects.value.filter(p => 
    p.applicationStatus === '待审核'
  ).length
  
  const applyingProjects = myProjects.value.filter(p => 
    p.applicationStatus === '申请中'
  ).length
  
  // 已报名项目 = 只计算已通过审核的项目
  const appliedProjects = myProjects.value.filter(p => 
    p.applicationStatus === '已通过' || p.participationStatus === '运行中'
  ).length
  
  const activeProjects = myProjects.value.filter(p => 
    p.participationStatus === '运行中'
  ).length
  
  const completedProjects = myProjects.value.filter(p => 
    p.participationStatus === '已完成' || p.progress?.percentage >= 100
  ).length
  
  // 正在进行的项目 = 已通过审核但未完成的项目
  const ongoingProjects = myProjects.value.filter(p => 
    (p.applicationStatus === '已通过' || p.participationStatus === '运行中') && 
    p.participationStatus !== '已完成' && 
    (p.progress?.percentage || 0) < 100
  ).length
  
  // 计算佣金币（从已参与的项目中获得）
  const creditsEarned = myProjects.value
    .filter(p => p.participationStatus === '运行中' || p.participationStatus === '已完成')
    .reduce((total, project) => total + (project.commissionCoins || project.credits || 0), 0)
  
  // 更新统计显示，保持图标配置不变
  statistics.value[0] = {
    ...statistics.value[0],
    value: availableProjects.toString()  // 可报名项目
  }
  statistics.value[1] = {
    ...statistics.value[1],
    value: pendingProjects.toString()     // 待审核
  }
  statistics.value[2] = {
    ...statistics.value[2],
    value: ongoingProjects.toString()      // 正在进行的项目
  }
  statistics.value[3] = {
    ...statistics.value[3],
    value: creditsEarned.toString()      // 获得佣金币
  }
  
  console.log('📊 本地统计数据计算完成:', {
    可报名项目: availableProjects,
    已申请项目: appliedProjects,
    待审核: pendingProjects,
    正在进行的项目: ongoingProjects,
    已完成项目: completedProjects,
    获得佣金币: creditsEarned,
    全部项目数: allProjects.value.length,
    我的项目数: myProjects.value.length
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
        console.log('📝 后端暂无全部项目数据')
      }
    }
    
    if (response && response.data) {
      console.log(`✅ 项目数据刷新成功 (数据源: ${dataSource})`)
      console.log('📊 返回的数据结构:', response.data)
    }
  } catch (error) {
    console.warn('⚠️ 刷新项目数据失败:', error)
    // 即使刷新失败也不影响用户体验
  }
}

// 初始化数据
const initializeData = async () => {
  // 检查并设置Token（开发环境下）
  await ensureValidToken()
  
  // 默认显示我的项目
  showMyProjects.value = true
  await Promise.all([
    fetchProjectStats(), // 获取统计数据
    loadMyProjects()    // 加载我的项目
  ])
}

// 确保有有效的Token
const ensureValidToken = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('⚠️ 未找到Token，尝试设置测试Token...')
      // 设置测试Token（用于开发环境）
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEwIiwidXNlcm5hbWUiOiJjeGsiLCJpYXQiOjE3NjUyNDI5NjEsImV4cCI6MTc2NTI0NjU2MX0.RnwazyycvVqTPUhey0kCdpQn_r7OgIdxxl4I89dFJp4'
      localStorage.setItem('token', testToken)
      console.log('✅ 已设置测试Token')
      
      // 同时设置用户信息
      const testUserInfo = {
        id: 1010,
        username: 'cxk',
        studentId: '22222',
        email: '22222@qq.com',
        name: 'cxk'
      }
      localStorage.setItem('userInfo', JSON.stringify(testUserInfo))
      console.log('✅ 已设置测试用户信息')
    } else {
      console.log('✅ Token已存在:', token.substring(0, 20) + '...')
    }
  } catch (error) {
    console.error('❌ 设置Token失败:', error)
  }
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
      transition: all 0.3s;

      &.stat-card-clickable {
        cursor: pointer;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          min-width: 0;

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: $text-primary;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .stat-label {
            font-size: 12px;
            color: $text-secondary;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
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
    .stats-row {
      .stat-card {
        .stat-content {
          gap: 8px;
          padding: 8px;

          .stat-icon {
            width: 40px;
            height: 40px;

            .el-icon {
              font-size: 20px;
            }
          }

          .stat-info {
            .stat-value {
              font-size: 18px;
            }

            .stat-label {
              font-size: 11px;
            }
          }
        }
      }
    }

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

@media (max-width: 1200px) and (min-width: 769px) {
  .project-training-container {
    .stats-row {
      .stat-card {
        .stat-content {
          gap: 10px;
          padding: 6px;

          .stat-icon {
            width: 44px;
            height: 44px;

            .el-icon {
              font-size: 22px;
            }
          }

          .stat-info {
            .stat-value {
              font-size: 19px;
            }

            .stat-label {
              font-size: 11px;
            }
          }
        }
      }
    }
  }
}
</style>
