<template>
  <div class="project-training-container">
    <div class="page-header">
      <h1 class="page-title">项目实训</h1>
      <p class="page-desc">选择企业真实项目进行实训，提升实战能力</p>
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

    <!-- 项目列表 -->
    <div class="projects-grid">
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

          <div class="project-footer">
            <el-button
              type="primary"
              :disabled="project.status !== '可报名' || project.enrolled >= project.capacity"
              @click="handleApply(project)"
            >
              <el-icon><CircleCheck /></el-icon>
              {{ project.status === '可报名' && project.enrolled < project.capacity ? '立即报名' : '不可报名' }}
            </el-button>
            <el-button @click="handleViewDetail(project)">
              <el-icon><View /></el-icon>
              查看详情
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
import { ref, computed } from 'vue'
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
  DataAnalysis
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'

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

const statistics = ref([
  {
    label: '可报名项目',
    value: '12',
    icon: 'Collection',
    color: themeColors.gradientPrimary
  },
  {
    label: '已报名项目',
    value: '3',
    icon: 'Briefcase',
    color: themeColors.gradientPink
  },
  {
    label: '已完成项目',
    value: '2',
    icon: 'Trophy',
    color: themeColors.gradientBlue
  },
  {
    label: '获得学分',
    value: '2',
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
  let result = allProjects.value

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

const handleApply = (project) => {
  selectedProject.value = project
  applyForm.value = {
    name: '张三',
    studentId: '2021001',
    phone: '',
    email: '',
    introduction: ''
  }
  applyDialogVisible.value = true
}

const handleSubmitApply = async () => {
  if (!applyFormRef.value) return

  try {
    await applyFormRef.value.validate()
    ElMessage.success('报名成功！请等待审核')
    applyDialogVisible.value = false
    if (selectedProject.value) {
      selectedProject.value.enrolled++
    }
  } catch {
    ElMessage.error('请填写完整信息')
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
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.project-training-container {
  .page-header {
    margin-bottom: 24px;

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
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
