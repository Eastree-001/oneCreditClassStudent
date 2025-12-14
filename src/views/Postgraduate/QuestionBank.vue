<template>
  <div class="question-bank">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>
        <el-icon :size="28"><Document /></el-icon>
        题库练习
      </h1>
      <p class="subtitle">海量题目，智能练习，提升解题能力</p>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <div class="filter-content">
        <div class="filter-item">
          <span class="filter-label">科目：</span>
          <el-select v-model="filters.subject" placeholder="全部科目" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="数学" value="math" />
            <el-option label="英语" value="english" />
            <el-option label="政治" value="politics" />
            <el-option label="专业课" value="major" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">题型：</span>
          <el-select v-model="filters.type" placeholder="全部题型" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
            <el-option label="填空题" value="fill" />
            <el-option label="简答题" value="short" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">难度：</span>
          <el-select v-model="filters.difficulty" placeholder="全部难度" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">年份：</span>
          <el-select v-model="filters.year" placeholder="全部年份" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="2024" value="2024" />
            <el-option label="2023" value="2023" />
            <el-option label="2022" value="2022" />
            <el-option label="2021" value="2021" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </el-card>

    <!-- 题目列表 -->
    <div class="questions-section">
      <div class="section-header">
        <div class="header-left">
          <h2>题目列表</h2>
          <el-tag type="info">共 {{ totalQuestions }} 道题</el-tag>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'">
              <el-icon><List /></el-icon>
              列表
            </el-button>
            <el-button :type="viewMode === 'card' ? 'primary' : ''" @click="viewMode = 'card'">
              <el-icon><Grid /></el-icon>
              卡片
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="questions-list">
        <el-card 
          v-for="question in questions" 
          :key="question.id"
          class="question-card"
          shadow="hover"
          @click="handleViewQuestion(question)"
        >
          <div class="question-item">
            <div class="question-header">
              <div class="question-info">
                <el-tag :type="getSubjectType(question.category)" size="small">
                  {{ question.category }}
                </el-tag>
                <el-tag :type="getDifficultyType(question.difficulty)" size="small">
                  {{ getDifficultyText(question.difficulty) }}
                </el-tag>
                <el-tag type="info" size="small">{{ question.typeText }}</el-tag>
                <span class="question-year">{{ question.year }}年</span>
              </div>
              <div class="question-actions">
                <el-button text type="primary" @click.stop="handleStartPractice(question)">
                  <el-icon><EditPen /></el-icon>
                  开始练习
                </el-button>
              </div>
            </div>
            <div class="question-content">
              <p class="question-text">{{ question.content }}</p>
            </div>
            <div class="question-footer">
              <span class="question-stats">
                <el-icon><View /></el-icon>
                已练习 {{ question.practiceCount }} 次
              </span>
              <span class="question-stats">
                <el-icon><Star /></el-icon>
                正确率 {{ question.correctRate }}%
              </span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 卡片视图 -->
      <el-row v-else :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="question in questions" :key="question.id">
          <el-card 
            class="question-card-grid"
            shadow="hover"
            @click="handleViewQuestion(question)"
          >
            <div class="question-card-content">
              <div class="card-header">
                <div class="card-tags">
                  <el-tag :type="getSubjectType(question.category)" size="small">
                    {{ question.category }}
                  </el-tag>
                  <el-tag :type="getDifficultyType(question.difficulty)" size="small">
                    {{ getDifficultyText(question.difficulty) }}
                  </el-tag>
                </div>
                <span class="card-year">{{ question.year }}</span>
              </div>
              <div class="card-body">
                <p class="card-question">{{ question.content }}</p>
              </div>
              <div class="card-footer">
                <div class="card-stats">
                  <span><el-icon><View /></el-icon> {{ question.practiceCount }}</span>
                  <span><el-icon><Star /></el-icon> {{ question.correctRate }}%</span>
                </div>
                <el-button type="primary" size="small" @click.stop="handleStartPractice(question)">
                  开始练习
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalQuestions"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 答题对话框 -->
    <el-dialog
      v-model="showQuestionDialog"
      :title="currentQuestion?.category + ' - ' + currentQuestion?.typeText"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentQuestion" class="question-detail">
        <div class="question-header-detail">
          <div class="question-meta">
            <el-tag :type="getDifficultyType(currentQuestion.difficulty)" size="small">
              {{ getDifficultyText(currentQuestion.difficulty) }}
            </el-tag>
            <span class="question-year-detail">{{ currentQuestion.year }}年真题</span>
          </div>
          <div class="question-timer" v-if="isPracticing">
            <el-icon><Timer /></el-icon>
            <span>已用时：{{ formatTime(timeSpent) }}</span>
          </div>
        </div>

        <div class="question-body">
          <div class="question-content-detail">
            <p>{{ currentQuestion.content }}</p>
          </div>

          <!-- 选择题选项 -->
          <div v-if="['single', 'multiple'].includes(currentQuestion.type)" class="question-options">
            <el-radio-group 
              v-if="currentQuestion.type === 'single'"
              v-model="userAnswer"
            >
              <el-radio 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :label="option"
                class="option-item"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group 
              v-else
              v-model="userAnswer"
            >
              <el-checkbox 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :label="option"
                class="option-item"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 判断题 -->
          <div v-else-if="currentQuestion.type === 'judge'" class="question-judge">
            <el-radio-group v-model="userAnswer">
              <el-radio label="正确">正确</el-radio>
              <el-radio label="错误">错误</el-radio>
            </el-radio-group>
          </div>

          <!-- 填空题 -->
          <div v-else-if="currentQuestion.type === 'fill'" class="question-fill">
            <el-input
              v-model="userAnswer"
              type="textarea"
              :rows="4"
              placeholder="请输入答案"
            />
          </div>

          <!-- 答案和解析（提交后显示） -->
          <div v-if="showAnswer" class="question-answer">
            <el-divider />
            <div class="answer-section">
              <div class="answer-result" :class="{ correct: isCorrect, wrong: !isCorrect }">
                <el-icon :size="24">
                  <component :is="isCorrect ? 'Check' : 'Close'" />
                </el-icon>
                <span>{{ isCorrect ? '回答正确' : '回答错误' }}</span>
              </div>
              <div class="correct-answer">
                <strong>正确答案：</strong>{{ currentQuestion.correctAnswer }}
              </div>
              <div class="answer-explanation">
                <strong>解析：</strong>
                <p>{{ currentQuestion.explanation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showQuestionDialog = false">关闭</el-button>
          <el-button v-if="!showAnswer" type="primary" @click="handleSubmitAnswer">
            提交答案
          </el-button>
          <el-button v-else type="primary" @click="handleNextQuestion">
            下一题
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Document,
  Search,
  Refresh,
  List,
  Grid,
  EditPen,
  View,
  Star,
  Timer,
  Check,
  Close
} from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage } from 'element-plus'

// 筛选条件
const filters = ref({
  subject: '',
  type: '',
  difficulty: '',
  year: ''
})

// 视图模式
const viewMode = ref('list')

// 题目列表
const questions = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const totalQuestions = ref(0)

// 答题对话框
const showQuestionDialog = ref(false)
const currentQuestion = ref(null)
const userAnswer = ref('')
const showAnswer = ref(false)
const isCorrect = ref(false)
const isPracticing = ref(false)
const timeSpent = ref(0)
let timer = null

// 搜索
const handleSearch = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters.value
    }
    const response = await postgraduateApi.getQuestions(params)
    if (response && response.data) {
      questions.value = response.data.list || []
      totalQuestions.value = response.data.total || 0
    } else {
      // 模拟数据
      loadMockQuestions()
    }
  } catch (error) {
    console.error('搜索题目失败:', error)
    loadMockQuestions()
  }
}

// 加载模拟数据
const loadMockQuestions = () => {
  const mockQuestions = []
  const subjects = ['数学', '英语', '政治', '专业课']
  const types = ['single', 'multiple', 'judge', 'fill']
  const typeTexts = ['单选题', '多选题', '判断题', '填空题']
  const difficulties = ['easy', 'medium', 'hard']
  const years = [2024, 2023, 2022, 2021]

  for (let i = 1; i <= 50; i++) {
    const typeIndex = Math.floor(Math.random() * types.length)
    mockQuestions.push({
      id: i,
      category: subjects[Math.floor(Math.random() * subjects.length)],
      type: types[typeIndex],
      typeText: typeTexts[typeIndex],
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      year: years[Math.floor(Math.random() * years.length)],
      content: `这是第${i}道题目，请仔细阅读题目内容并选择正确答案。题目内容可能涉及多个知识点，需要综合运用所学知识。`,
      options: ['选项A', '选项B', '选项C', '选项D'],
      correctAnswer: '选项A',
      explanation: '这是题目的详细解析，说明了为什么选择这个答案。',
      practiceCount: Math.floor(Math.random() * 100),
      correctRate: Math.floor(Math.random() * 30) + 70
    })
  }

  questions.value = mockQuestions
  totalQuestions.value = mockQuestions.length
}

// 重置筛选
const handleReset = () => {
  filters.value = {
    subject: '',
    type: '',
    difficulty: '',
    year: ''
  }
  handleSearch()
}

// 查看题目
const handleViewQuestion = (question) => {
  currentQuestion.value = question
  showQuestionDialog.value = true
  showAnswer.value = false
  userAnswer.value = ''
  isPracticing.value = false
  timeSpent.value = 0
}

// 开始练习
const handleStartPractice = (question) => {
  handleViewQuestion(question)
  isPracticing.value = true
  timeSpent.value = 0
  
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    timeSpent.value++
  }, 1000)
}

// 提交答案
const handleSubmitAnswer = async () => {
  if (!userAnswer.value) {
    ElMessage.warning('请先选择或输入答案')
    return
  }

  try {
    const answer = Array.isArray(userAnswer.value) 
      ? userAnswer.value.join(',') 
      : userAnswer.value
    
    const response = await postgraduateApi.submitAnswer(currentQuestion.value.id, {
      answer: answer,
      timeSpent: timeSpent.value
    })

    if (timer) clearInterval(timer)

    showAnswer.value = true
    const correctAnswer = Array.isArray(currentQuestion.value.correctAnswer)
      ? currentQuestion.value.correctAnswer.join(',')
      : currentQuestion.value.correctAnswer
    
    isCorrect.value = answer === correctAnswer

    if (isCorrect.value) {
      ElMessage.success('回答正确！')
    } else {
      ElMessage.error('回答错误，请查看解析')
    }
  } catch (error) {
    console.error('提交答案失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}

// 下一题
const handleNextQuestion = () => {
  const currentIndex = questions.value.findIndex(q => q.id === currentQuestion.value.id)
  if (currentIndex < questions.value.length - 1) {
    handleStartPractice(questions.value[currentIndex + 1])
  } else {
    showQuestionDialog.value = false
    ElMessage.info('已经是最后一题了')
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}

const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取科目类型
const getSubjectType = (subject) => {
  const map = {
    '数学': 'primary',
    '英语': 'success',
    '政治': 'warning',
    '专业课': 'danger'
  }
  return map[subject] || 'info'
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
  handleSearch()
})
</script>

<style lang="scss" scoped>
.question-bank {
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

.filter-card {
  margin-bottom: 24px;
  border: none;

  .filter-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .filter-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .filter-label {
        font-size: 14px;
        color: #606266;
        white-space: nowrap;
      }
    }
  }
}

.questions-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
        color: #303133;
      }
    }
  }

  .questions-list {
    .question-card {
      margin-bottom: 16px;
      border: none;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-2px);
      }

      .question-item {
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;

          .question-info {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            .question-year {
              font-size: 14px;
              color: #909399;
            }
          }
        }

        .question-content {
          margin-bottom: 12px;

          .question-text {
            font-size: 15px;
            color: #303133;
            line-height: 1.6;
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .question-footer {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: #909399;

          .question-stats {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }

  .question-card-grid {
    margin-bottom: 16px;
    border: none;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .question-card-content {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-tags {
          display: flex;
          gap: 8px;
        }

        .card-year {
          font-size: 12px;
          color: #909399;
        }
      }

      .card-body {
        margin-bottom: 12px;
        min-height: 80px;

        .card-question {
          font-size: 14px;
          color: #303133;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .pagination-section {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

.question-detail {
  .question-header-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    .question-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .question-year-detail {
        font-size: 14px;
        color: #909399;
      }
    }

    .question-timer {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #409EFF;
    }
  }

  .question-body {
    .question-content-detail {
      margin-bottom: 24px;

      p {
        font-size: 16px;
        line-height: 1.8;
        color: #303133;
        margin: 0;
      }
    }

    .question-options {
      margin-bottom: 24px;

      .option-item {
        display: block;
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 1.6;
      }
    }

    .question-judge {
      margin-bottom: 24px;
    }

    .question-fill {
      margin-bottom: 24px;
    }

    .question-answer {
      margin-top: 24px;

      .answer-section {
        .answer-result {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;

          &.correct {
            background: #f0f9ff;
            color: #67C23A;
          }

          &.wrong {
            background: #fef0f0;
            color: #F56C6C;
          }
        }

        .correct-answer {
          margin-bottom: 16px;
          font-size: 15px;
          color: #303133;

          strong {
            color: #409EFF;
          }
        }

        .answer-explanation {
          font-size: 14px;
          color: #606266;
          line-height: 1.8;

          strong {
            color: #303133;
          }

          p {
            margin: 8px 0 0 0;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
}
</style>

