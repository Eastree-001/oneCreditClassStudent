<template>
  <div class="smart-supervision">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <el-icon :size="28"><Bell /></el-icon>
        智能督学
      </h1>
      <p class="subtitle">智能学习监督，助力高效备考</p>
    </div>

    <!-- 督学仪表盘 -->
    <div class="dashboard-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="item in dashboardStats" :key="item.key">
          <el-card class="dashboard-card" shadow="hover">
            <div class="dashboard-content">
              <div class="dashboard-icon" :style="{ background: item.color }">
                <el-icon :size="24"><component :is="item.icon" /></el-icon>
              </div>
              <div class="dashboard-info">
                <div class="dashboard-value">{{ item.value }}</div>
                <div class="dashboard-label">{{ item.label }}</div>
                <div class="dashboard-trend" :class="item.trend">
                  <el-icon :size="12"><component :is="item.trendIcon" /></el-icon>
                  <span>{{ item.trendText }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 今日学习打卡 -->
    <div class="checkin-section">
      <el-card class="checkin-card">
        <template #header>
          <div class="card-header">
            <span>今日学习打卡</span>
            <el-tag :type="checkInStatus.type" size="small">{{ checkInStatus.text }}</el-tag>
          </div>
        </template>
        <div class="checkin-content">
          <div class="checkin-info">
            <div class="checkin-stats">
              <div class="stat-item">
                <div class="stat-value">{{ checkInData.studyTime }}</div>
                <div class="stat-label">今日学习时长（小时）</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ checkInData.questionCount }}</div>
                <div class="stat-label">完成题目数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ checkInData.streakDays }}</div>
                <div class="stat-label">连续打卡天数</div>
              </div>
            </div>
            <el-button 
              type="primary" 
              size="large" 
              :disabled="checkInStatus.completed"
              @click="handleCheckIn"
            >
              <el-icon><Check /></el-icon>
              {{ checkInStatus.completed ? '今日已打卡' : '立即打卡' }}
            </el-button>
          </div>
          <div class="checkin-calendar">
            <div class="calendar-title">本月打卡日历</div>
            <div class="calendar-grid">
              <div 
                v-for="day in calendarDays" 
                :key="day.date"
                class="calendar-day"
                :class="{ 
                  checked: day.checked, 
                  today: day.isToday,
                  future: day.isFuture
                }"
              >
                <div class="day-number">{{ day.day }}</div>
                <div v-if="day.checked" class="day-check">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 学习提醒 -->
    <div class="reminders-section">
      <div class="section-header">
        <h2>
          <el-icon><Bell /></el-icon>
          学习提醒
        </h2>
        <el-button type="primary" size="small" @click="showReminderDialog = true">
          <el-icon><Plus /></el-icon>
          添加提醒
        </el-button>
      </div>
      <el-card class="reminders-card">
        <el-empty v-if="reminders.length === 0" description="暂无学习提醒" :image-size="100" />
        <div v-else class="reminders-list">
          <div 
            v-for="reminder in reminders" 
            :key="reminder.id"
            class="reminder-item"
            :class="{ completed: reminder.completed }"
          >
            <div class="reminder-content">
              <el-checkbox 
                v-model="reminder.completed"
                @change="handleReminderComplete(reminder)"
              >
                <div class="reminder-info">
                  <div class="reminder-title">{{ reminder.title }}</div>
                  <div class="reminder-meta">
                    <el-tag :type="reminder.type" size="small">{{ reminder.category }}</el-tag>
                    <span class="reminder-time">{{ reminder.time }}</span>
                  </div>
                </div>
              </el-checkbox>
            </div>
            <div class="reminder-actions">
              <el-button text type="danger" @click="handleDeleteReminder(reminder.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 学习报告 -->
    <div class="report-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-card class="report-card">
            <template #header>
              <div class="card-header">
                <span>本周学习统计</span>
                <el-select v-model="reportPeriod" size="small" style="width: 100px">
                  <el-option label="本周" value="week" />
                  <el-option label="本月" value="month" />
                </el-select>
              </div>
            </template>
            <div class="report-chart">
              <div class="chart-placeholder">
                <el-icon :size="48" color="#409EFF"><TrendCharts /></el-icon>
                <p>学习时长趋势图</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-card class="report-card">
            <template #header>
              <div class="card-header">
                <span>学习效率分析</span>
              </div>
            </template>
            <div class="efficiency-analysis">
              <div class="efficiency-item">
                <div class="efficiency-label">平均学习时长</div>
                <div class="efficiency-value">{{ efficiencyData.avgStudyTime }}小时/天</div>
              </div>
              <div class="efficiency-item">
                <div class="efficiency-label">答题正确率</div>
                <div class="efficiency-value">{{ efficiencyData.correctRate }}%</div>
              </div>
              <div class="efficiency-item">
                <div class="efficiency-label">知识点掌握率</div>
                <div class="efficiency-value">{{ efficiencyData.masteryRate }}%</div>
              </div>
              <div class="efficiency-item">
                <div class="efficiency-label">学习专注度</div>
                <el-progress 
                  :percentage="efficiencyData.focusLevel" 
                  :color="getFocusColor(efficiencyData.focusLevel)"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 督学建议 -->
    <div class="advice-section">
      <el-card class="advice-card">
        <template #header>
          <div class="card-header">
            <span>
              <el-icon><Lightbulb /></el-icon>
              个性化学习建议
            </span>
          </div>
        </template>
        <div class="advice-content">
          <el-empty v-if="adviceList.length === 0" description="暂无学习建议" :image-size="100" />
          <div v-else class="advice-list">
            <div 
              v-for="(advice, index) in adviceList" 
              :key="index"
              class="advice-item"
            >
              <el-icon class="advice-icon" :color="advice.color"><component :is="advice.icon" /></el-icon>
              <div class="advice-text">
                <div class="advice-title">{{ advice.title }}</div>
                <div class="advice-desc">{{ advice.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 添加提醒对话框 -->
    <el-dialog
      v-model="showReminderDialog"
      title="添加学习提醒"
      width="500px"
    >
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="提醒标题">
          <el-input v-model="reminderForm.title" placeholder="请输入提醒标题" />
        </el-form-item>
        <el-form-item label="提醒类型">
          <el-select v-model="reminderForm.type" placeholder="请选择提醒类型">
            <el-option label="每日学习" value="daily" />
            <el-option label="题目练习" value="question" />
            <el-option label="知识点复习" value="review" />
            <el-option label="考试提醒" value="exam" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒时间">
          <el-time-picker
            v-model="reminderForm.time"
            format="HH:mm"
            placeholder="选择提醒时间"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="reminderForm.priority">
            <el-radio label="low">低</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="high">高</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReminderDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddReminder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Bell,
  Timer,
  Collection,
  TrendCharts,
  Check,
  Plus,
  Delete,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

// 仪表盘统计
const dashboardStats = ref([
  {
    key: 'todayTime',
    label: '今日学习时长',
    value: '2.5小时',
    icon: Timer,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: 'up',
    trendIcon: ArrowUp,
    trendText: '+0.5小时'
  },
  {
    key: 'weekTime',
    label: '本周学习时长',
    value: '18小时',
    icon: Timer,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: 'up',
    trendIcon: ArrowUp,
    trendText: '+3小时'
  },
  {
    key: 'completion',
    label: '目标完成度',
    value: '75%',
    icon: TrendCharts,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: 'up',
    trendIcon: ArrowUp,
    trendText: '+5%'
  },
  {
    key: 'efficiency',
    label: '学习效率',
    value: '良好',
    icon: Bell,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    trend: 'stable',
    trendIcon: InfoFilled,
    trendText: '稳定'
  }
])

// 打卡状态
const checkInStatus = ref({
  completed: false,
  type: 'success',
  text: '未打卡'
})

// 打卡数据
const checkInData = ref({
  studyTime: 2.5,
  questionCount: 15,
  streakDays: 7
})

// 日历数据
const calendarDays = ref([])

// 学习提醒
const reminders = ref([
  {
    id: 1,
    title: '完成数学练习30分钟',
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
    title: '学习政治知识点',
    category: '政治',
    type: 'warning',
    time: '19:00',
    completed: true
  }
])

// 报告周期
const reportPeriod = ref('week')

// 效率数据
const efficiencyData = ref({
  avgStudyTime: 2.5,
  correctRate: 78,
  masteryRate: 65,
  focusLevel: 82
})

// 学习建议
const adviceList = ref([
  {
    title: '建议增加数学练习时间',
    desc: '根据你的学习数据，建议每天增加30分钟数学练习时间，以提高解题能力',
    icon: Warning,
    color: '#E6A23C'
  },
  {
    title: '保持当前学习节奏',
    desc: '你的学习效率良好，连续打卡7天，建议继续保持当前的学习节奏',
    icon: InfoFilled,
    color: '#409EFF'
  },
  {
    title: '注意错题复习',
    desc: '你最近有15道错题未复习，建议每周安排时间复习错题，巩固薄弱知识点',
    icon: Warning,
    color: '#F56C6C'
  }
])

// 添加提醒对话框
const showReminderDialog = ref(false)
const reminderForm = ref({
  title: '',
  type: '',
  time: null,
  priority: 'medium'
})

// 初始化日历
const initCalendar = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days = []
  
  // 填充空白
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: '', day: '', checked: false, isToday: false, isFuture: false })
  }

  // 填充日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isToday = date.toDateString() === today.toDateString()
    const isFuture = date > today
    const checked = Math.random() > 0.3 && !isFuture // 模拟已打卡数据

    days.push({
      date: `${year}-${month + 1}-${day}`,
      day: day,
      checked,
      isToday,
      isFuture
    })
  }

  calendarDays.value = days
}

// 打卡处理
const handleCheckIn = async () => {
  try {
    await postgraduateApi.checkIn({
      studyTime: checkInData.value.studyTime,
      completedTasks: [],
      notes: '今日学习打卡'
    })
    checkInStatus.value = {
      completed: true,
      type: 'success',
      text: '已打卡'
    }
    checkInData.value.streakDays++
    ElMessage.success('打卡成功！')
  } catch (error) {
    console.error('打卡失败:', error)
    ElMessage.error('打卡失败，请稍后重试')
  }
}

// 提醒完成处理
const handleReminderComplete = async (reminder) => {
  try {
    await postgraduateApi.updateReminderStatus(reminder.id, reminder.completed)
    ElMessage.success('提醒状态已更新')
  } catch (error) {
    console.error('更新提醒失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 删除提醒
const handleDeleteReminder = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个提醒吗？', '提示', {
      type: 'warning'
    })
    reminders.value = reminders.value.filter(r => r.id !== id)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 添加提醒
const handleAddReminder = async () => {
  if (!reminderForm.value.title || !reminderForm.value.type || !reminderForm.value.time) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    const timeStr = reminderForm.value.time.toTimeString().slice(0, 5)
    const newReminder = {
      id: Date.now(),
      title: reminderForm.value.title,
      category: reminderForm.value.type === 'daily' ? '每日学习' : 
                 reminderForm.value.type === 'question' ? '题目练习' :
                 reminderForm.value.type === 'review' ? '知识点复习' : '考试提醒',
      type: reminderForm.value.priority === 'high' ? 'danger' :
            reminderForm.value.priority === 'medium' ? 'warning' : 'info',
      time: timeStr,
      completed: false
    }
    
    await postgraduateApi.createReminder({
      title: reminderForm.value.title,
      type: reminderForm.value.type,
      scheduledTime: timeStr,
      priority: reminderForm.value.priority
    })

    reminders.value.push(newReminder)
    showReminderDialog.value = false
    reminderForm.value = {
      title: '',
      type: '',
      time: null,
      priority: 'medium'
    }
    ElMessage.success('提醒添加成功')
  } catch (error) {
    console.error('添加提醒失败:', error)
    ElMessage.error('添加失败，请稍后重试')
  }
}

// 获取专注度颜色
const getFocusColor = (level) => {
  if (level >= 80) return '#67C23A'
  if (level >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 加载数据
const loadData = async () => {
  try {
    const dashboardData = await postgraduateApi.getSupervisionDashboard()
    if (dashboardData && dashboardData.data) {
      const data = dashboardData.data
      // 更新仪表盘数据
    }

    const remindersData = await postgraduateApi.getStudyReminders()
    if (remindersData && remindersData.data) {
      reminders.value = remindersData.data
    }

    const adviceData = await postgraduateApi.getSupervisionAdvice()
    if (adviceData && adviceData.data) {
      adviceList.value = adviceData.data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  initCalendar()
  loadData()
})
</script>

<style lang="scss" scoped>
.smart-supervision {
  .page-header {
    margin-bottom: 24px;

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #303133;
    }

    .subtitle {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }
}

.dashboard-section {
  margin-bottom: 24px;

  .dashboard-card {
    border: none;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .dashboard-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .dashboard-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .dashboard-info {
        flex: 1;

        .dashboard-value {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 4px;
        }

        .dashboard-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .dashboard-trend {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.up {
            color: #67C23A;
          }

          &.down {
            color: #F56C6C;
          }

          &.stable {
            color: #909399;
          }
        }
      }
    }
  }
}

.checkin-section {
  margin-bottom: 24px;

  .checkin-card {
    border: none;

    .checkin-content {
      .checkin-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;

        .checkin-stats {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;

          .stat-item {
            text-align: center;

            .stat-value {
              font-size: 32px;
              font-weight: 700;
              color: #409EFF;
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 14px;
              color: #909399;
            }
          }
        }
      }

      .checkin-calendar {
        .calendar-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #303133;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;

          .calendar-day {
            aspect-ratio: 1;
            border: 2px solid #f0f0f0;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: all 0.3s;

            &.checked {
              background: #e1f3ff;
              border-color: #409EFF;

              .day-check {
                position: absolute;
                top: 4px;
                right: 4px;
                color: #409EFF;
              }
            }

            &.today {
              border-color: #67C23A;
              background: #f0f9ff;
            }

            &.future {
              opacity: 0.5;
            }

            .day-number {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
            }
          }
        }
      }
    }
  }
}

.reminders-section {
  margin-bottom: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #303133;
    }
  }

  .reminders-card {
    border: none;

    .reminders-list {
      .reminder-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

          .reminder-title {
            text-decoration: line-through;
          }
        }

        .reminder-content {
          flex: 1;

          .reminder-info {
            margin-left: 8px;

            .reminder-title {
              font-size: 15px;
              color: #303133;
              margin-bottom: 8px;
            }

            .reminder-meta {
              display: flex;
              align-items: center;
              gap: 12px;

              .reminder-time {
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }
    }
  }
}

.report-section {
  margin-bottom: 24px;

  .report-card {
    border: none;
    height: 100%;

    .report-chart {
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

    .efficiency-analysis {
      .efficiency-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .efficiency-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .efficiency-value {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}

.advice-section {
  .advice-card {
    border: none;

    .advice-content {
      .advice-list {
        .advice-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.3s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: #f5f7fa;
          }

          .advice-icon {
            font-size: 24px;
            flex-shrink: 0;
          }

          .advice-text {
            flex: 1;

            .advice-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
              margin-bottom: 4px;
            }

            .advice-desc {
              font-size: 14px;
              color: #606266;
              line-height: 1.6;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .checkin-info {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .checkin-stats {
    width: 100%;
    justify-content: space-around;
  }
}
</style>

