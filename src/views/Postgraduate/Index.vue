<template>
  <div class="postgraduate-index">
    <!-- 顶部横幅 -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="banner-left">
          <h1 class="banner-title">
            <el-icon :size="32"><Reading /></el-icon>
            考研学习中心
          </h1>
          <p class="banner-subtitle">智能督学，助你成功上岸</p>
        </div>
        <div class="banner-right">
          <div class="countdown-card">
            <div class="countdown-label">距离考研还有</div>
            <div class="countdown-time">
              <span class="time-item">
                <span class="time-value">{{ countdown.days }}</span>
                <span class="time-unit">天</span>
              </span>
              <span class="time-separator">:</span>
              <span class="time-item">
                <span class="time-value">{{ countdown.hours }}</span>
                <span class="time-unit">时</span>
              </span>
              <span class="time-separator">:</span>
              <span class="time-item">
                <span class="time-value">{{ countdown.minutes }}</span>
                <span class="time-unit">分</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.key">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" :style="{ background: stat.color }">
                <el-icon :size="24"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速入口 -->
    <div class="quick-access-section">
      <h2 class="section-title">
        <el-icon><Lightning /></el-icon>
        快速入口
      </h2>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6" v-for="item in quickAccess" :key="item.path">
          <el-card 
            class="access-card" 
            shadow="hover" 
            @click="handleNavigate(item.path)"
          >
            <div class="access-content">
              <div class="access-icon" :style="{ background: item.color }">
                <el-icon :size="28"><component :is="item.icon" /></el-icon>
              </div>
              <div class="access-info">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 今日学习任务 -->
    <div class="tasks-section">
      <h2 class="section-title">
        <el-icon><List /></el-icon>
        今日学习任务
      </h2>
      <el-card class="tasks-card">
        <div v-if="todayTasks.length > 0">
          <div 
            v-for="task in todayTasks" 
            :key="task.id" 
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <el-checkbox 
              v-model="task.completed" 
              @change="handleTaskComplete(task)"
            >
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <el-tag :type="task.type" size="small">{{ task.category }}</el-tag>
                  <span class="task-time">{{ task.time }}</span>
                </div>
              </div>
            </el-checkbox>
          </div>
        </div>
        <el-empty v-else description="今日暂无学习任务" :image-size="100" />
      </el-card>
    </div>

    <!-- 学习进度 -->
    <div class="progress-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-card class="progress-card">
            <template #header>
              <div class="card-header">
                <span>本周学习时长</span>
                <el-tag type="success" size="small">7天</el-tag>
              </div>
            </template>
            <div class="chart-container">
              <div class="chart-placeholder">
                <el-icon :size="48" color="#409EFF"><TrendCharts /></el-icon>
                <p>学习时长趋势图</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-card class="progress-card">
            <template #header>
              <div class="card-header">
                <span>科目学习进度</span>
              </div>
            </template>
            <div class="subject-progress">
              <div 
                v-for="subject in subjectProgress" 
                :key="subject.id" 
                class="progress-item"
              >
                <div class="progress-label">
                  <span>{{ subject.name }}</span>
                  <span class="progress-percent">{{ subject.progress }}%</span>
                </div>
                <el-progress 
                  :percentage="subject.progress" 
                  :color="subject.color"
                  :stroke-width="8"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近学习记录 -->
    <div class="recent-section">
      <h2 class="section-title">
        <el-icon><Clock /></el-icon>
        最近学习记录
      </h2>
      <el-card class="recent-card">
        <el-timeline>
          <el-timeline-item
            v-for="record in recentRecords"
            :key="record.id"
            :timestamp="record.time"
            :type="record.type"
            placement="top"
          >
            <div class="record-content">
              <h4>{{ record.title }}</h4>
              <p>{{ record.desc }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Reading,
  Lightning,
  List,
  TrendCharts,
  Clock,
  Star,
  Document,
  TrendCharts as TrendChartsIcon,
  InfoFilled,
  ChatDotRound,
  User,
  Bell,
  Timer,
  Collection,
  DataAnalysis
} from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 倒计时
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0
})

// 学习统计
const stats = ref([
  {
    key: 'studyTime',
    label: '总学习时长',
    value: '0小时',
    icon: Timer,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    key: 'questions',
    label: '完成题目',
    value: '0',
    icon: Collection,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    key: 'knowledgePoints',
    label: '掌握知识点',
    value: '0',
    icon: Star,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    key: 'checkInDays',
    label: '连续打卡',
    value: '0天',
    icon: DataAnalysis,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 快速入口
const quickAccess = ref([
  {
    title: '科目优化',
    desc: '重点知识点',
    icon: Star,
    path: '/postgraduate/subject-optimization',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '题库练习',
    desc: '刷题训练',
    icon: Document,
    path: '/postgraduate/question-bank',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '成长路线',
    desc: '学习规划',
    icon: TrendChartsIcon,
    path: '/postgraduate/growth-path',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '智能督学',
    desc: '学习监督',
    icon: Bell,
    path: '/postgraduate/smart-supervision',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    title: 'AI教师',
    desc: '智能问答',
    icon: ChatDotRound,
    path: '/postgraduate/ai-teacher',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    title: '保研建议',
    desc: '政策指导',
    icon: InfoFilled,
    path: '/postgraduate/recommendation-advice',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
])

// 今日学习任务
const todayTasks = ref([
  {
    id: 1,
    title: '完成数学高等数学第一章练习',
    category: '数学',
    type: 'primary',
    time: '09:00',
    completed: false
  },
  {
    id: 2,
    title: '复习英语单词100个',
    category: '英语',
    type: 'success',
    time: '14:00',
    completed: false
  },
  {
    id: 3,
    title: '学习政治马原知识点',
    category: '政治',
    type: 'warning',
    time: '19:00',
    completed: true
  }
])

// 科目学习进度
const subjectProgress = ref([
  { id: 1, name: '数学', progress: 65, color: '#409EFF' },
  { id: 2, name: '英语', progress: 45, color: '#67C23A' },
  { id: 3, name: '政治', progress: 30, color: '#E6A23C' },
  { id: 4, name: '专业课', progress: 55, color: '#F56C6C' }
])

// 最近学习记录
const recentRecords = ref([
  {
    id: 1,
    title: '完成数学练习',
    desc: '完成了高等数学第一章的10道题目，正确率80%',
    time: '2024-12-07 14:30',
    type: 'primary'
  },
  {
    id: 2,
    title: '学习英语单词',
    desc: '学习了100个新单词，掌握率75%',
    time: '2024-12-07 10:20',
    type: 'success'
  },
  {
    id: 3,
    title: '查看知识点',
    desc: '学习了政治马原的核心概念',
    time: '2024-12-06 16:45',
    type: 'warning'
  }
])

let countdownTimer = null

// 计算倒计时
const calculateCountdown = () => {
  // 假设考研日期是2025年12月23日
  const examDate = new Date('2025-12-23 08:00:00')
  const now = new Date()
  const diff = examDate - now

  if (diff > 0) {
    countdown.value.days = Math.floor(diff / (1000 * 60 * 60 * 24))
    countdown.value.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    countdown.value.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  } else {
    countdown.value = { days: 0, hours: 0, minutes: 0 }
  }
}

// 导航处理
const handleNavigate = (path) => {
  router.push(path)
}

// 任务完成处理
const handleTaskComplete = (task) => {
  ElMessage.success(`${task.completed ? '已完成' : '已取消'}：${task.title}`)
}

// 加载数据
const loadData = async () => {
  try {
    // 加载督学仪表盘数据
    const dashboardData = await postgraduateApi.getSupervisionDashboard()
    if (dashboardData && dashboardData.data) {
      const data = dashboardData.data
      stats.value[0].value = `${Math.floor(data.totalStudyTime / 60)}小时`
      stats.value[1].value = data.questionCount || '0'
      stats.value[2].value = data.knowledgePointsLearned || '0'
      stats.value[3].value = `${data.checkInStreak || 0}天`
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  calculateCountdown()
  countdownTimer = setInterval(calculateCountdown, 60000) // 每分钟更新一次
  loadData()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.postgraduate-index {
  padding: 0;
}

.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;

    .banner-left {
      .banner-title {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .banner-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .banner-right {
      .countdown-card {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 20px 32px;
        text-align: center;

        .countdown-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 12px;
        }

        .countdown-time {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;

          .time-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .time-value {
              font-size: 36px;
              font-weight: 700;
              line-height: 1;
            }

            .time-unit {
              font-size: 12px;
              opacity: 0.8;
              margin-top: 4px;
            }
          }

          .time-separator {
            font-size: 24px;
            opacity: 0.6;
            margin: 0 4px;
          }
        }
      }
    }
  }
}

.stats-section {
  margin-bottom: 24px;

  .stat-card {
    border: none;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

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
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.quick-access-section,
.tasks-section,
.progress-section,
.recent-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #303133;
  }
}

.access-card {
  cursor: pointer;
  border: none;
  transition: transform 0.3s;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-4px);
  }

  .access-content {
    text-align: center;
    padding: 8px;

    .access-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      color: white;
    }

    .access-info {
      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: #303133;
      }

      p {
        font-size: 12px;
        color: #909399;
        margin: 0;
      }
    }
  }
}

.tasks-card {
  border: none;

  .task-item {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.3s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f5f7fa;
    }

    &.completed {
      opacity: 0.6;

      .task-title {
        text-decoration: line-through;
      }
    }

    .task-content {
      margin-left: 8px;

      .task-title {
        font-size: 15px;
        color: #303133;
        margin-bottom: 8px;
      }

      .task-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .task-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

.progress-card {
  border: none;
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .chart-container {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;

    .chart-placeholder {
      text-align: center;
      color: #909399;

      p {
        margin-top: 12px;
        font-size: 14px;
      }
    }
  }

  .subject-progress {
    .progress-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: #303133;

        .progress-percent {
          font-weight: 600;
          color: #409EFF;
        }
      }
    }
  }
}

.recent-card {
  border: none;

  .record-content {
    h4 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #303133;
    }

    p {
      font-size: 13px;
      color: #909399;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .banner-section {
    .banner-content {
      flex-direction: column;
      text-align: center;
    }
  }

  .countdown-time {
    .time-item .time-value {
      font-size: 28px !important;
    }
  }
}
</style>

