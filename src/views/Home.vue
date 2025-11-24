<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1 class="greeting">
            你好，{{ userInfo.name }} 👋
            <el-tag :type="hasCompletedCourse ? 'success' : 'info'" size="large" class="certification-tag">
              {{ hasCompletedCourse ? '学分认证' : '无学分认证' }}
            </el-tag>
          </h1>
          <p class="subtitle">欢迎回到EduNexus一学分课堂</p>
        </div>
        <div class="banner-stats">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalCourses }}</div>
            <div class="stat-label">已选课程</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.completionRate }}%</div>
            <div class="stat-label">完成进度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h2 class="section-title">
        <el-icon><Lightning /></el-icon>
        快速操作
      </h2>
      <div class="action-grid">
        <el-card
          v-for="action in quickActions"
          :key="action.path"
          class="action-card"
          shadow="hover"
          @click="handleAction(action.path)"
        >
          <div class="action-content">
            <div class="action-icon" :style="{ background: action.color }">
              <el-icon :size="28">
                <component :is="action.icon" />
              </el-icon>
            </div>
            <div class="action-info">
              <h3>{{ action.title }}</h3>
              <p>{{ action.desc }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 主要内容区域 - 左右分栏 -->
    <el-row :gutter="20" class="main-content-row">
      <!-- 左侧内容 -->
      <el-col :xs="24" :lg="16">
        <!-- 学习统计图表 -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>学习统计</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart :option="studyChartOption" style="height: 300px" />
        </el-card>

        <!-- 学生技能展示 -->
        <el-card class="skills-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>我的技能</span>
            </div>
          </template>
          <v-chart :option="skillsChartOption" style="height: 300px" />
        </el-card>

        <!-- 最近课程 -->
        <div class="recent-courses">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Clock /></el-icon>
              最近学习的课程
            </h2>
            <el-button type="primary" text @click="$router.push('/progress')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
      <el-row :gutter="20">
        <el-col
          v-for="course in recentCourses"
          :key="course.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card class="course-card" shadow="hover">
            <div class="course-header">
              <el-tag :type="course.status === '进行中' ? 'success' : 'info'">
                {{ course.status }}
              </el-tag>
              <span class="course-credits">{{ course.credits }}学分</span>
            </div>
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-enterprise">课程来源：{{ course.enterprise }}</p>
            <div class="course-progress">
              <div class="progress-info">
                <span>学习进度</span>
                <span>{{ course.progress }}%</span>
              </div>
              <el-progress
                :percentage="course.progress"
                :color="getProgressColor(course.progress)"
                :stroke-width="8"
              />
            </div>
            <div class="course-footer">
              <el-button type="primary" size="small" text>
                继续学习
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
        </div>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :xs="24" :lg="8">
        <!-- 学习日历 -->
        <el-card class="calendar-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>学习日历</span>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
          </template>
          <el-calendar v-model="calendarDate">
            <template #date-cell="{ data }">
              <div class="calendar-cell">
                <div class="date-number">{{ data.day.split('-').slice(2).join('-') }}</div>
                <div v-if="hasEvent(data.day)" class="event-dot"></div>
              </div>
            </template>
          </el-calendar>
          <div class="calendar-events">
            <div v-for="event in todayEvents" :key="event.id" class="event-item">
              <el-tag :type="event.type" size="small">{{ event.type === 'warning' ? '作业' : '考试' }}</el-tag>
              <span class="event-title">{{ event.title }}</span>
            </div>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todo-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-badge :value="todoList.filter(t => !t.completed).length" class="todo-badge">
                <el-button type="text" size="small" @click="showTodoDialog = true">管理</el-button>
              </el-badge>
            </div>
          </template>
          <div class="todo-list">
            <div
              v-for="todo in todoList.slice(0, 5)"
              :key="todo.id"
              class="todo-item"
              :class="{ completed: todo.completed }"
            >
              <el-checkbox v-model="todo.completed" @change="handleTodoChange(todo)">
                <span class="todo-text">{{ todo.title }}</span>
              </el-checkbox>
              <el-tag v-if="todo.deadline" :type="getDeadlineType(todo.deadline)" size="small">
                {{ formatDeadline(todo.deadline) }}
              </el-tag>
            </div>
            <el-empty v-if="todoList.length === 0" description="暂无待办事项" :image-size="80" />
          </div>
        </el-card>

        <!-- 通知公告 -->
        <el-card class="notice-card" shadow="never">
          <template #header>
            <span>通知公告</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="notice in notices.slice(0, 3)"
              :key="notice.id"
              :timestamp="notice.time"
              placement="top"
              size="small"
            >
              <div class="notice-item">
                <h4>{{ notice.title }}</h4>
                <p>{{ notice.content }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项对话框 -->
    <el-dialog v-model="showTodoDialog" title="待办事项管理" width="600px">
      <div class="todo-dialog-content">
        <el-input
          v-model="newTodoTitle"
          placeholder="添加新的待办事项"
          @keyup.enter="addTodo"
          class="todo-input"
        >
          <template #append>
            <el-button @click="addTodo">添加</el-button>
          </template>
        </el-input>
        <div class="todo-list-full">
          <div
            v-for="todo in todoList"
            :key="todo.id"
            class="todo-item-full"
            :class="{ completed: todo.completed }"
          >
            <el-checkbox v-model="todo.completed">
              <span class="todo-text">{{ todo.title }}</span>
            </el-checkbox>
            <el-date-picker
              v-model="todo.deadline"
              type="date"
              placeholder="设置截止日期"
              size="small"
              style="width: 150px; margin-left: 10px"
            />
            <el-button
              type="danger"
              text
              size="small"
              @click="removeTodo(todo.id)"
              style="margin-left: 10px"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTodoDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Lightning,
  Clock,
  ArrowRight,
  Bell,
  Document,
  DataAnalysis,
  Briefcase
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'

const router = useRouter()

const userInfo = ref({
  name: '张三'
})

const stats = ref({
  totalCourses: 8,
  completionRate: 75
})

// 判断是否有完成的课程
const hasCompletedCourse = computed(() => {
  return recentCourses.value.some(course => course.status === '已完成')
})

const chartTimeRange = ref('week')
const calendarDate = ref(new Date())
const showTodoDialog = ref(false)
const newTodoTitle = ref('')
const todoIdCounter = ref(4)

const quickActions = ref([
  {
    title: '选课',
    desc: '选择新课程',
    icon: 'Document',
    path: '/course-selection',
    color: themeColors.gradientPrimary
  },
  {
    title: '学习进度',
    desc: '查看学习进度',
    icon: 'DataAnalysis',
    path: '/progress',
    color: themeColors.gradientPink
  },
  {
    title: '项目实训',
    desc: '选择项目实训',
    icon: 'Briefcase',
    path: '/project-training',
    color: themeColors.gradientBlue
  }
])

const recentCourses = ref([
  {
    id: 1,
    name: 'Vue.js前端开发',
    enterprise: '李氏企业',
    credits: 1,
    progress: 65,
    status: '进行中'
  },
  {
    id: 2,
    name: 'Python数据分析',
    enterprise: '王氏企业',
    credits: 1,
    progress: 80,
    status: '进行中'
  },
  {
    id: 3,
    name: '数据库系统原理',
    enterprise: '张氏企业',
    credits: 1,
    progress: 100,
    status: '已完成'
  }
])

const notices = ref([
  {
    id: 1,
    title: '选课通知',
    content: '2024春季学期选课即将开始，请同学们及时关注选课时间。',
    time: '2024-01-15 10:00'
  },
  {
    id: 2,
    title: '项目实训报名',
    content: '企业项目实训报名通道已开启，有意向的同学请尽快报名。',
    time: '2024-01-14 14:30'
  },
  {
    id: 3,
    title: '学习进度提醒',
    content: '部分课程学习进度较低，请合理安排学习时间。',
    time: '2024-01-13 09:00'
  }
])

const todoList = ref([
  {
    id: 1,
    title: '完成Vue.js前端开发作业',
    completed: false,
    deadline: '2024-01-20'
  },
  {
    id: 2,
    title: '准备Python数据分析考试',
    completed: false,
    deadline: '2024-01-25'
  },
  {
    id: 3,
    title: '提交项目实训报告',
    completed: true,
    deadline: '2024-01-18'
  },
  {
    id: 4,
    title: '复习数据结构与算法',
    completed: false,
    deadline: '2024-01-22'
  }
])

const calendarEvents = ref([
  { date: '2024-01-20', title: 'Vue.js作业截止', type: 'warning' },
  { date: '2024-01-22', title: '数据结构复习', type: 'info' },
  { date: '2024-01-25', title: 'Python数据分析考试', type: 'danger' }
])

const studyHoursData = {
  week: {
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    hours: [2.5, 3.0, 2.0, 3.5, 2.5, 1.5, 1.0]
  },
  month: {
    days: ['第1周', '第2周', '第3周', '第4周'],
    hours: [15, 18, 16, 14]
  }
}

// 学生技能数据
const skillsData = ref([
  { name: 'Vue.js前端开发', value: 35 },
  { name: 'React高级开发', value: 25 },
  { name: 'Python数据分析', value: 20 },
  { name: '数据库系统', value: 12 },
  { name: 'Node.js后端', value: 8 }
])

// 技能图表配置
const skillsChartOption = computed(() => {
  // 使用 ECharts 支持的渐变颜色配置
  const colors = [
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#76afff' },
        { offset: 1, color: '#4facfe' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#de97ff' },
        { offset: 1, color: '#f093fb' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#4facfe' },
        { offset: 1, color: '#00f2fe' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#43e97b' },
        { offset: 1, color: '#38f9d7' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#f093fb' },
        { offset: 1, color: '#f5576c' }
      ]
    }
  ]
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12,
        color: themeColors.textRegular
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 8
    },
    series: [
      {
        name: '技能分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: themeColors.textPrimary
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: skillsData.value.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  }
})

const handleAction = (path) => {
  router.push(path)
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return themeColors.dangerColor
  if (percentage < 80) return themeColors.warningColor
  return themeColors.successColor
}

// 学习统计图表配置
const studyChartOption = computed(() => {
  const data = chartTimeRange.value === 'week' ? studyHoursData.week : studyHoursData.month
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.days,
      axisLine: {
        lineStyle: {
          color: themeColors.chartColors.axisLine
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '学习时长(小时)',
      axisLine: {
        lineStyle: {
          color: themeColors.chartColors.axisLine
        }
      },
      splitLine: {
        lineStyle: {
          color: themeColors.chartColors.splitLine
        }
      }
    },
    series: [
      {
        name: '学习时长',
        type: 'bar',
        data: data.hours,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: themeColors.chartColors.gradientStart },
              { offset: 1, color: themeColors.chartColors.gradientEnd }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: themeColors.chartColors.shadowColor
          }
        }
      }
    ]
  }
})

// 日历相关方法
const hasEvent = (date) => {
  return calendarEvents.value.some(event => event.date === date)
}

const todayEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return calendarEvents.value.filter(event => event.date === today)
})

// 待办事项相关方法
const addTodo = () => {
  if (!newTodoTitle.value.trim()) return
  todoList.value.push({
    id: todoIdCounter.value++,
    title: newTodoTitle.value,
    completed: false,
    deadline: null
  })
  newTodoTitle.value = ''
}

const removeTodo = (id) => {
  const index = todoList.value.findIndex(t => t.id === id)
  if (index > -1) {
    todoList.value.splice(index, 1)
  }
}

const handleTodoChange = (todo) => {
  // 可以在这里添加保存逻辑
}

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  const date = new Date(deadline)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays <= 7) return `${diffDays}天后`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getDeadlineType = (deadline) => {
  if (!deadline) return 'info'
  const date = new Date(deadline)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger'
  if (diffDays <= 2) return 'warning'
  return 'success'
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.home-container {
  .welcome-banner {
    position: relative;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    color: white;
    overflow: hidden;
    background-image: url('@/img/jimeng-2025-11-04-5365-现代简约风格，以渐变蓝色为主色调，从浅蓝到深蓝的柔和渐变，画面左侧有一个年轻亚洲....png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    // 背景图片透明度遮罩层 - 50%透明度效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(118, 175, 255, 0.5) 0%, rgba(0, 99, 221, 0.5) 100%);
      z-index: 1;
    }

    .banner-content {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;

      .welcome-text {
        .greeting {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .certification-tag {
            font-size: 14px;
            font-weight: 500;
            padding: 6px 16px;
            border-radius: 20px;
          }
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }
      }

      .banner-stats {
        display: flex;
        gap: 32px;

        .stat-card {
          text-align: center;

          .stat-value {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: $text-primary;
  }

  .main-content-row {
    margin-top: 20px;
  }

  .chart-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .skills-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .calendar-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .calendar-cell {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .date-number {
        font-size: 14px;
      }

      .event-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $danger-color;
        margin-top: 2px;
      }
    }

    .calendar-events {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid $border-color;

      .event-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;

        .event-title {
          color: $text-regular;
        }
      }
    }
  }

  .todo-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .todo-list {
      max-height: 300px;
      overflow-y: auto;

      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid $border-color;

        &:last-child {
          border-bottom: none;
        }

        &.completed {
          opacity: 0.6;

          .todo-text {
            text-decoration: line-through;
          }
        }

        .todo-text {
          font-size: 14px;
          color: $text-regular;
        }
      }
    }
  }

  .notice-card {
    .notice-item {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: $text-primary;
      }

      p {
        font-size: 12px;
        color: $text-secondary;
        margin: 0;
        line-height: 1.5;
      }
    }
  }

  .todo-dialog-content {
    .todo-input {
      margin-bottom: 20px;
    }

    .todo-list-full {
      max-height: 400px;
      overflow-y: auto;

      .todo-item-full {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid $border-color;

        &:last-child {
          border-bottom: none;
        }

        &.completed {
          opacity: 0.6;

          .todo-text {
            text-decoration: line-through;
          }
        }

        .todo-text {
          font-size: 14px;
          color: $text-regular;
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 32px;

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

      .action-card {
        cursor: pointer;
        transition: all 0.3s;
        border: none;

        &:hover {
          transform: translateY(-4px);
        }

        .action-content {
          display: flex;
          align-items: center;
          gap: 16px;

          .action-icon {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .action-info {
            flex: 1;

            h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: $text-primary;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .recent-courses {
    margin-bottom: 32px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .course-card {
      margin-bottom: 20px;
      border: none;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .course-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

          .course-credits {
            font-size: 14px;
            color: $text-secondary;
          }
        }

        .course-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: $text-primary;
        }

        .course-enterprise {
          font-size: 14px;
          color: $text-regular;
          margin: 0 0 16px 0;
        }

        .course-progress {
          margin-bottom: 16px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: $text-regular;
            margin-bottom: 8px;
          }
        }

      .course-footer {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .notifications {
    .el-timeline {
      padding-left: 0;

      :deep(.el-timeline-item__content) {
        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: $text-regular;
          line-height: 1.6;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home-container {
    .welcome-banner {
      .banner-content {
        .banner-stats {
          width: 100%;
          justify-content: space-around;
        }
      }
    }

    .quick-actions {
      .action-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
