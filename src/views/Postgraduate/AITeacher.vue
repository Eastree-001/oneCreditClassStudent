<template>
  <div class="ai-teacher">
    <div class="page-header">
      <h1><el-icon :size="28"><ChatDotRound /></el-icon>AI教师问答</h1>
      <p class="subtitle">智能答疑，随时解答你的问题</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card class="chat-card">
          <div class="chat-messages" ref="messagesRef">
            <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
              <div class="message-avatar">
                <el-icon v-if="msg.role === 'user'"><User /></el-icon>
                <el-icon v-else><Robot /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
          </div>
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入你的问题..."
              @keydown.enter.ctrl="handleSend"
            />
            <el-button type="primary" @click="handleSend" :loading="sending">发送</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="recommended-card">
          <template #header>推荐问题</template>
          <div class="recommended-list">
            <el-button
              v-for="q in recommendedQuestions"
              :key="q"
              text
              style="width: 100%; text-align: left; margin-bottom: 8px"
              @click="inputMessage = q"
            >
              {{ q }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ChatDotRound, User, Robot } from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage } from 'element-plus'

const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content: '你好！我是AI教师，有什么问题可以问我。',
    time: '10:00'
  }
])

const inputMessage = ref('')
const sending = ref(false)
const messagesRef = ref(null)

const recommendedQuestions = ref([
  '如何高效复习数学？',
  '英语阅读理解的技巧有哪些？',
  '政治大题如何答题？'
])

const handleSend = async () => {
  if (!inputMessage.value.trim()) return

  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value,
    time: new Date().toLocaleTimeString()
  }
  messages.value.push(userMsg)
  const question = inputMessage.value
  inputMessage.value = ''
  sending.value = true

  try {
    const response = await postgraduateApi.askAITeacher({ question })
    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: response?.data?.answer || '这是一个模拟回答，实际需要对接AI服务。',
      time: new Date().toLocaleTimeString()
    }
    messages.value.push(assistantMsg)
  } catch (error) {
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    sending.value = false
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }
}

onMounted(async () => {
  try {
    const response = await postgraduateApi.getRecommendedQuestions()
    if (response?.data) {
      recommendedQuestions.value = response.data
    }
  } catch (error) {
    console.error('加载推荐问题失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.ai-teacher {
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
  }

  .chat-card {
    border: none;
    .chat-messages {
      height: 500px;
      overflow-y: auto;
      margin-bottom: 16px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      .message {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        &.user { flex-direction: row-reverse; }
        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #409EFF;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .message-content {
          max-width: 70%;
          .message-text {
            background: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 4px;
          }
          .message-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
    .chat-input {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }
  }
}
</style>

