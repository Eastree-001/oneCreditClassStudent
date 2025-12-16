<template>
  <div class="subject-optimization">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <el-icon :size="28"><Star /></el-icon>
        科目优化赋能
      </h1>
      <p class="subtitle">重点知识点标注，助力高效学习</p>
    </div>

    <!-- 科目卡片 -->
    <div class="subjects-section">
      <el-row :gutter="20">
        <el-col 
          :xs="24" 
          :sm="12" 
          :md="8" 
          v-for="subject in subjects" 
          :key="subject.id"
        >
          <el-card 
            class="subject-card" 
            shadow="hover"
            @click="handleSelectSubject(subject)"
          >
            <div class="subject-content">
              <div class="subject-icon" :style="{ background: subject.color }">
                <el-icon :size="32"><component :is="subject.icon" /></el-icon>
              </div>
              <div class="subject-info">
                <h3>{{ subject.name }}</h3>
                <div class="subject-stats">
                  <div class="stat-item">
                    <span class="stat-label">总知识点</span>
                    <span class="stat-value">{{ subject.totalPoints }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">已掌握</span>
                    <span class="stat-value">{{ subject.masteredPoints }}</span>
                  </div>
                </div>
                <el-progress 
                  :percentage="subject.progress" 
                  :color="subject.color"
                  :stroke-width="6"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 知识点列表 -->
    <div v-if="selectedSubject" class="knowledge-points-section">
      <el-card class="points-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon :size="20"><component :is="selectedSubject.icon" /></el-icon>
              <span>{{ selectedSubject.name }} - 重点知识点</span>
            </div>
            <div class="header-right">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索知识点"
                clearable
                style="width: 200px"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button text @click="selectedSubject = null">
                <el-icon><ArrowLeft /></el-icon>
                返回
              </el-button>
            </div>
          </div>
        </template>

        <div class="filter-bar">
          <el-radio-group v-model="filterType" @change="handleFilter">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="not_started">未开始</el-radio-button>
            <el-radio-button label="learning">学习中</el-radio-button>
            <el-radio-button label="mastered">已掌握</el-radio-button>
          </el-radio-group>
          <el-select v-model="sortType" placeholder="排序方式" style="width: 150px">
            <el-option label="按重要性" value="importance" />
            <el-option label="按频率" value="frequency" />
            <el-option label="按难度" value="difficulty" />
          </el-select>
        </div>

        <div class="points-list">
          <div 
            v-for="point in filteredPoints" 
            :key="point.id"
            class="point-item"
            :class="point.status"
          >
            <div class="point-content">
              <div class="point-header">
                <div class="point-title-section">
                  <h4>{{ point.title }}</h4>
                  <div class="point-tags">
                    <el-tag 
                      :type="getDifficultyType(point.difficulty)" 
                      size="small"
                    >
                      {{ getDifficultyText(point.difficulty) }}
                    </el-tag>
                    <el-tag type="warning" size="small">
                      重要性: {{ point.importance }}/5
                    </el-tag>
                    <el-tag type="info" size="small">
                      出现频率: {{ point.examFrequency }}次
                    </el-tag>
                  </div>
                </div>
                <el-select
                  v-model="point.status"
                  size="small"
                  style="width: 120px"
                  @change="handleStatusChange(point)"
                >
                  <el-option label="未开始" value="not_started" />
                  <el-option label="学习中" value="learning" />
                  <el-option label="已掌握" value="mastered" />
                </el-select>
              </div>
              <p class="point-description">{{ point.description }}</p>
              <div class="point-actions">
                <el-button text type="primary" @click="handleViewDetail(point)">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button text type="primary" @click="handlePractice(point)">
                  <el-icon><Document /></el-icon>
                  相关练习
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredPoints.length === 0" description="暂无知识点" :image-size="100" />
      </el-card>
    </div>

    <!-- 知识点详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="currentPoint?.title"
      width="700px"
    >
      <div v-if="currentPoint" class="point-detail">
        <div class="detail-section">
          <h4>知识点描述</h4>
          <p>{{ currentPoint.description }}</p>
        </div>
        <div class="detail-section">
          <h4>学习要点</h4>
          <ul class="key-points">
            <li v-for="(key, index) in currentPoint.keyPoints" :key="index">{{ key }}</li>
          </ul>
        </div>
        <div class="detail-section">
          <h4>历年真题</h4>
          <div class="exam-info">
            <el-tag>近5年出现{{ currentPoint.examFrequency }}次</el-tag>
            <el-tag type="success">2023年真题</el-tag>
            <el-tag type="success">2022年真题</el-tag>
          </div>
        </div>
        <div class="detail-section">
          <h4>相关题目</h4>
          <el-button type="primary" @click="handleGoToPractice">
            前往练习 ({{ currentPoint.relatedQuestions }}道题)
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleGoToPractice">开始练习</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Star,
  Search,
  ArrowLeft,
  View,
  Document,
  Reading,
  DataAnalysis,
  Collection,
  Notebook
} from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 科目列表
const subjects = ref([
  {
    id: 1,
    name: '数学',
    icon: DataAnalysis,
    color: '#409EFF',
    totalPoints: 120,
    masteredPoints: 45,
    progress: 38
  },
  {
    id: 2,
    name: '英语',
    icon: Reading,
    color: '#67C23A',
    totalPoints: 80,
    masteredPoints: 30,
    progress: 38
  },
  {
    id: 3,
    name: '政治',
    icon: Notebook,
    color: '#E6A23C',
    totalPoints: 100,
    masteredPoints: 25,
    progress: 25
  },
  {
    id: 4,
    name: '专业课',
    icon: Collection,
    color: '#F56C6C',
    totalPoints: 150,
    masteredPoints: 60,
    progress: 40
  }
])

// 选中的科目
const selectedSubject = ref(null)

// 知识点列表
const knowledgePoints = ref([])

// 搜索关键词
const searchKeyword = ref('')

// 筛选类型
const filterType = ref('all')

// 排序类型
const sortType = ref('importance')

// 详情对话框
const showDetailDialog = ref(false)
const currentPoint = ref(null)

// 筛选后的知识点
const filteredPoints = computed(() => {
  let points = [...knowledgePoints.value]

  // 搜索筛选
  if (searchKeyword.value) {
    points = points.filter(p => 
      p.title.includes(searchKeyword.value) || 
      p.description.includes(searchKeyword.value)
    )
  }

  // 状态筛选
  if (filterType.value !== 'all') {
    points = points.filter(p => p.status === filterType.value)
  }

  // 排序
  if (sortType.value === 'importance') {
    points.sort((a, b) => b.importance - a.importance)
  } else if (sortType.value === 'frequency') {
    points.sort((a, b) => b.examFrequency - a.examFrequency)
  } else if (sortType.value === 'difficulty') {
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
    points.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty])
  }

  return points
})

// 选择科目
const handleSelectSubject = async (subject) => {
  selectedSubject.value = subject
  try {
    const response = await postgraduateApi.getKeyKnowledgePoints(subject.id)
    if (response && response.data) {
      knowledgePoints.value = response.data
    } else {
      // 模拟数据
      knowledgePoints.value = generateMockPoints(subject.id)
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
    knowledgePoints.value = generateMockPoints(subject.id)
  }
}

// 生成模拟数据
const generateMockPoints = (subjectId) => {
  const difficulties = ['easy', 'medium', 'hard']
  const statuses = ['not_started', 'learning', 'mastered']
  const points = []

  for (let i = 1; i <= 20; i++) {
    points.push({
      id: subjectId * 100 + i,
      title: `知识点 ${i}`,
      description: `这是${subjects.value.find(s => s.id === subjectId)?.name}科目的第${i}个重点知识点，需要重点掌握。`,
      difficulty: difficulties[Math.floor(Math.random() * 3)],
      importance: Math.floor(Math.random() * 3) + 3,
      examFrequency: Math.floor(Math.random() * 10) + 1,
      status: statuses[Math.floor(Math.random() * 3)],
      relatedQuestions: Math.floor(Math.random() * 20) + 5,
      keyPoints: [
        '核心概念理解',
        '解题方法掌握',
        '常见题型练习'
      ]
    })
  }

  return points
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑已在computed中处理
}

// 状态变更处理
const handleStatusChange = async (point) => {
  try {
    await postgraduateApi.updateKnowledgePointStatus(point.id, point.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 查看详情
const handleViewDetail = (point) => {
  currentPoint.value = point
  showDetailDialog.value = true
}

// 练习处理
const handlePractice = (point) => {
  router.push({
    path: '/postgraduate/question-bank',
    query: { knowledgePoint: point.id }
  })
}

// 前往练习
const handleGoToPractice = () => {
  if (currentPoint.value) {
    router.push({
      path: '/postgraduate/question-bank',
      query: { knowledgePoint: currentPoint.value.id }
    })
  }
}

// 获取难度类型
const getDifficultyType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || '未知'
}

onMounted(() => {
  // 可以在这里加载初始数据
})
</script>

<style lang="scss" scoped>
.subject-optimization {
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

.subjects-section {
  margin-bottom: 24px;

  .subject-card {
    cursor: pointer;
    border: none;
    transition: transform 0.3s;
    margin-bottom: 16px;

    &:hover {
      transform: translateY(-4px);
    }

    .subject-content {
      display: flex;
      gap: 16px;
      align-items: center;

      .subject-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .subject-info {
        flex: 1;

        h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #303133;
        }

        .subject-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 12px;

          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-label {
              font-size: 12px;
              color: #909399;
            }

            .stat-value {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }
          }
        }
      }
    }
  }
}

.knowledge-points-section {
  .points-card {
    border: none;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .points-list {
      .point-item {
        padding: 20px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.3s;

        &:hover {
          border-color: #409EFF;
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
        }

        &.mastered {
          background: #f0f9ff;
          border-color: #67C23A;
        }

        &.learning {
          background: #fff7e6;
          border-color: #E6A23C;
        }

        .point-content {
          .point-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 12px;

            .point-title-section {
              flex: 1;

              h4 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 8px 0;
                color: #303133;
              }

              .point-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
              }
            }
          }

          .point-description {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
            margin: 0 0 12px 0;
          }

          .point-actions {
            display: flex;
            gap: 12px;
          }
        }
      }
    }
  }
}

.point-detail {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #303133;
    }

    p {
      font-size: 14px;
      color: #606266;
      line-height: 1.8;
      margin: 0;
    }

    .key-points {
      margin: 0;
      padding-left: 20px;

      li {
        font-size: 14px;
        color: #606266;
        line-height: 2;
      }
    }

    .exam-info {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start !important;
  }
}
</style>

