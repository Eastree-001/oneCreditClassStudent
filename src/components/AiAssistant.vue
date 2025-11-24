<template>
  <div class="ai-assistant">
    <!-- 悬浮对话面板 -->
    <div v-show="visible" class="ai-panel" :style="{ boxShadow: panelShadow }">
      <div class="ai-panel__header">
        <div class="title">
          <el-icon :size="18"><ChatDotRound /></el-icon>
          <span>AI 助手</span>
        </div>
        <div class="actions">
          <el-button text size="small" @click="visible = false">关闭</el-button>
        </div>
      </div>
      <div class="ai-panel__body">
        <div class="messages" ref="messagesRef">
          <div v-for="m in messages" :key="m.id" class="message" :class="m.role">
            <div class="bubble">
              <p>{{ m.content }}</p>
              <span class="time">{{ m.time }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="ai-panel__footer">
        <el-input
          v-model="input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 3 }"
          placeholder="请输入你的问题..."
          @keydown.enter.prevent="handleSend"
        />
        <el-button type="primary" :loading="sending" @click="handleSend">发送</el-button>
      </div>
    </div>

    <!-- 悬浮按钮 -->
    <el-button
      class="ai-fab"
      type="primary"
      :style="{ background: themeColors.primaryColor, borderColor: themeColors.primaryColor }"
      circle
      size="large"
      @click="visible = !visible"
    >
      <el-icon :size="22" style="color: #fff"><ChatDotRound /></el-icon>
    </el-button>
  </div>
  
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'

const visible = ref(false)
const input = ref('')
const sending = ref(false)
const messages = ref([
  { id: 1, role: 'assistant', content: '你好，我是 AI 助手，很高兴为你服务。', time: new Date().toLocaleTimeString() }
])

const messagesRef = ref(null)
const scrollToBottom = async () => {
  await nextTick()
  const el = messagesRef.value
  if (el) el.scrollTop = el.scrollHeight
}

const panelShadow = '0 16px 40px rgba(0,0,0,0.18)'

const handleSend = async () => {
  const text = input.value.trim()
  if (!text || sending.value) return
  const userMsg = { id: Date.now(), role: 'user', content: text, time: new Date().toLocaleTimeString() }
  messages.value.push(userMsg)
  input.value = ''
  sending.value = true
  await scrollToBottom()

  // 模拟 AI 回复
  setTimeout(async () => {
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: '已收到你的问题（演示回复）。后续可接入后端 API 返回真实答案。',
      time: new Date().toLocaleTimeString()
    })
    sending.value = false
    await scrollToBottom()
  }, 600)
}

onMounted(scrollToBottom)
</script>

<style lang="scss" scoped>
.ai-assistant {
  .ai-panel {
    position: fixed;
    right: 24px;
    bottom: 110px;
    width: 420px;
    height: 70vh;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    border: 1px solid #ebeef5;

    .ai-panel__header {
      height: 44px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;

      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #303133;
      }
    }

    .ai-panel__body {
      flex: 1;
      overflow: hidden;

      .messages {
        height: 100%;
        overflow-y: auto;
        padding: 12px 12px;
        background: #fff;

        .message {
          display: flex;
          margin-bottom: 10px;

          &.assistant { justify-content: flex-start; }
          &.user { justify-content: flex-end; }

          .bubble {
            max-width: 80%;
            padding: 10px 12px;
            border-radius: 12px;
            background: #f5f7fa;
            color: #303133;
            .time {
              display: block;
              margin-top: 6px;
              font-size: 12px;
              color: #909399;
              text-align: right;
            }
          }
          &.user .bubble { background: #e8f1ff; }
        }
      }
    }

    .ai-panel__footer {
      display: flex;
      gap: 8px;
      align-items: flex-end;
      padding: 10px 12px 12px;
      background: #fafafa;
      border-top: 1px solid #ebeef5;

      :deep(.el-textarea__inner) { border-radius: 8px; }
    }
  }

  .ai-fab {
    position: fixed;
    right: 24px;
    bottom: 40px;
    z-index: 3000;
    width: 56px;
    height: 56px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
  }

  .chat-window {
    display: flex;
    flex-direction: column;
    height: 60vh;
    max-height: 600px;

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px 4px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 12px;

      .message {
        display: flex;
        margin-bottom: 8px;

        &.assistant { justify-content: flex-start; }
        &.user { justify-content: flex-end; }

        .bubble {
          max-width: 80%;
          padding: 10px 12px;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

          .time {
            display: block;
            margin-top: 6px;
            font-size: 12px;
            color: #909399;
            text-align: right;
          }
        }

        &.assistant .bubble { background: #fff; color: #303133; }
        &.user .bubble { background: #e8f1ff; color: #303133; }
      }
    }

    .composer {
      display: flex;
      gap: 8px;
      align-items: flex-end;

      :deep(.el-textarea__inner) {
        border-radius: 8px;
      }
    }
  }
}
</style>


