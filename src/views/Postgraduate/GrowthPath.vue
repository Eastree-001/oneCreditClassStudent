<template>
  <div class="growth-path">
    <div class="page-header">
      <h1><el-icon :size="28"><TrendCharts /></el-icon>个人成长路线</h1>
      <p class="subtitle">科学规划学习路径，稳步提升</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>学习路线时间线</span>
              <el-tag type="success">进行中</el-tag>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="node in pathNodes"
              :key="node.id"
              :timestamp="node.period"
              :type="node.status === 'completed' ? 'success' : node.status === 'in_progress' ? 'primary' : 'info'"
              placement="top"
            >
              <el-card class="node-card" :class="node.status">
                <div class="node-header">
                  <h3>{{ node.title }}</h3>
                  <el-tag :type="getStatusType(node.status)">{{ getStatusText(node.status) }}</el-tag>
                </div>
                <p class="node-desc">{{ node.description }}</p>
                <div class="node-tasks">
                  <div v-for="task in node.tasks" :key="task.id" class="task-item">
                    <el-checkbox v-model="task.completed" :disabled="node.status === 'pending'">
                      {{ task.name }}
                    </el-checkbox>
                  </div>
                </div>
                <div class="node-progress">
                  <el-progress :percentage="node.progress" :color="getProgressColor(node.status)" />
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="plan-card">
          <template #header>学习计划</template>
          <div class="plan-content">
            <div class="plan-item">
              <div class="plan-label">每日学习时长</div>
              <div class="plan-value">{{ studyPlan.dailyTime }}小时</div>
            </div>
            <div class="plan-item">
              <div class="plan-label">每周目标</div>
              <div class="plan-value">{{ studyPlan.weeklyGoals.length }}个</div>
            </div>
            <el-button type="primary" style="width: 100%; margin-top: 16px" @click="showPlanDialog = true">
              编辑计划
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showPlanDialog" title="编辑学习计划" width="600px">
      <el-form :model="studyPlan" label-width="120px">
        <el-form-item label="每日学习时长">
          <el-input-number v-model="studyPlan.dailyTime" :min="1" :max="12" />
          <span style="margin-left: 8px">小时</span>
        </el-form-item>
        <el-form-item label="每周目标">
          <el-input v-model="studyPlan.weeklyGoals" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPlanDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSavePlan">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage } from 'element-plus'

const pathNodes = ref([
  {
    id: 1,
    title: '基础阶段',
    period: '2024年9月 - 2024年12月',
    description: '系统学习基础知识，打好基础',
    status: 'completed',
    progress: 100,
    tasks: [
      { id: 1, name: '完成数学基础课程', completed: true },
      { id: 2, name: '掌握英语核心词汇', completed: true },
      { id: 3, name: '学习政治基础理论', completed: true }
    ]
  },
  {
    id: 2,
    title: '强化阶段',
    period: '2025年1月 - 2025年6月',
    description: '深入学习，专项突破',
    status: 'in_progress',
    progress: 45,
    tasks: [
      { id: 4, name: '完成数学强化训练', completed: true },
      { id: 5, name: '英语阅读专项练习', completed: false },
      { id: 6, name: '政治时政热点学习', completed: false }
    ]
  },
  {
    id: 3,
    title: '冲刺阶段',
    period: '2025年7月 - 2025年12月',
    description: '真题模拟，查漏补缺',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: 7, name: '完成历年真题', completed: false },
      { id: 8, name: '模拟考试训练', completed: false },
      { id: 9, name: '错题回顾复习', completed: false }
    ]
  }
])

const studyPlan = ref({
  dailyTime: 3,
  weeklyGoals: ['完成数学练习', '复习英语单词', '学习政治知识点']
})

const showPlanDialog = ref(false)

const getStatusType = (status) => {
  const map = { completed: 'success', in_progress: 'primary', pending: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { completed: '已完成', in_progress: '进行中', pending: '未开始' }
  return map[status] || '未知'
}

const getProgressColor = (status) => {
  if (status === 'completed') return '#67C23A'
  if (status === 'in_progress') return '#409EFF'
  return '#C0C4CC'
}

const handleSavePlan = async () => {
  try {
    await postgraduateApi.saveStudyPlan(studyPlan.value)
    ElMessage.success('计划保存成功')
    showPlanDialog.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

onMounted(async () => {
  try {
    const response = await postgraduateApi.getGrowthPath()
    if (response?.data) {
      pathNodes.value = response.data.nodes || pathNodes.value
    }
  } catch (error) {
    console.error('加载成长路线失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.growth-path {
  .page-header {
    margin-bottom: 24px;
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .subtitle {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .timeline-card {
    border: none;
    .node-card {
      margin-bottom: 16px;
      &.completed { border-left: 4px solid #67C23A; }
      &.in_progress { border-left: 4px solid #409EFF; }
      .node-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        h3 { margin: 0; font-size: 18px; }
      }
      .node-desc { color: #606266; margin-bottom: 12px; }
      .node-tasks { margin-bottom: 12px; }
      .node-progress { margin-top: 12px; }
    }
  }

  .plan-card {
    border: none;
    .plan-item {
      margin-bottom: 16px;
      .plan-label { font-size: 14px; color: #909399; margin-bottom: 4px; }
      .plan-value { font-size: 24px; font-weight: 700; color: #303133; }
    }
  }
}
</style>

