<template>
  <div class="video-learning-container">
    <div class="video-wrapper" v-if="currentVideo">
      <!-- 视频播放区域 -->
      <div class="video-player-section">
        <div class="video-header">
          <el-button @click="goBack" circle>
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <div class="video-title-area">
            <h2 class="course-title">{{ currentVideo.syllabusTitle || currentVideo.title || currentVideo.name || '课程视频' }}</h2>
            <el-tag v-if="currentVideo.chapter" type="success" size="small" style="margin-left: 10px;">
              第{{ currentVideo.chapter }}章
            </el-tag>
          </div>
          <div class="video-progress">
            <span>{{ currentIndex + 1 }}/{{ videos.length }}</span>
          </div>
        </div>

        <!-- 视频播放器 -->
        <div class="video-player">
          <div v-if="currentVideo && !getVideoUrl(currentVideo)" class="video-url-warning">
            <el-icon><Warning /></el-icon>
            <span>当前视频没有可用的播放URL，请检查数据源</span>
          </div>
          <video
            ref="videoPlayer"
            :src="getVideoUrl(currentVideo)"
            :poster="currentVideo.cover || currentVideo.poster || ''"
            controls
            @ended="handleVideoEnd"
            @timeupdate="handleTimeUpdate"
          ></video>
        </div>

        <!-- 视频控制按钮 -->
        <div class="video-controls">
          <el-button
            :disabled="currentIndex === 0"
            @click="previousVideo"
            :icon="ArrowLeft"
          >
            上一集
          </el-button>
          <el-button @click="markAsCompleted" type="success" :icon="Select">
            标记为已学完
          </el-button>
          <el-button
            :disabled="currentIndex === videos.length - 1"
            @click="nextVideo"
          >
            下一集<el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 视频列表侧边栏 -->
      <div class="video-list-section">
        <div class="list-header">
          <h3>课程目录</h3>
          <el-tag type="info">{{ videos.length }} 个视频</el-tag>
        </div>

        <div class="video-list">
          <div
            v-for="(video, index) in videos"
            :key="video.id || index"
            class="video-item"
            :class="{
              'active': index === currentIndex,
              'completed': video.completed
            }"
            @click="selectVideo(index)"
          >
            <div class="video-item-content">
              <div class="video-item-number">{{ index + 1 }}</div>
              <div class="video-item-info">
                <div class="video-item-title">{{ video.syllabusTitle || video.title || video.name || `视频 ${index + 1}` }}</div>
                <div class="video-item-meta">
                  <el-tag v-if="video.chapter" type="success" size="small" style="margin-right: 8px;">
                    第{{ video.chapter }}章
                  </el-tag>
                  <span v-if="getVideoDuration(video)">
                    <el-icon><Clock /></el-icon>
                    {{ getVideoDuration(video) }}
                  </span>
                  <span v-if="video.completed" class="completed-tag">
                    <el-icon><Select /></el-icon>
                    已学完
                  </span>
                  <!-- 调试信息：显示视频URL -->
                  <el-tooltip v-if="!getVideoUrl(video)" content="视频URL为空，无法播放" placement="top">
                    <span class="debug-info" style="color: #f56c6c; margin-left: 8px;">
                      <el-icon><Clock /></el-icon>
                      无URL
                    </span>
                  </el-tooltip>
                </div>
              </div>
              <el-icon v-if="index === currentIndex" class="playing-icon">
                <VideoPlay />
              </el-icon>
            </div>
          </div>
        </div>

        <el-empty v-if="videos.length === 0" description="暂无视频" />
      </div>
    </div>

    <el-empty v-else-if="loading" description="加载中...">
      <el-button type="primary" @click="fetchVideos">重新加载</el-button>
    </el-empty>

    <el-empty v-else description="暂无课程视频">
      <el-button @click="goBack">返回</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Select,
  VideoPlay,
  Clock,
  Warning
} from '@element-plus/icons-vue'
import { courseApi } from '@/api'
import { API_IP, API_PORT } from '@/config/api'

const route = useRoute()
const router = useRouter()

const courseId = ref(route.params.courseId)
const loading = ref(false)
const videos = ref([])
const currentIndex = ref(0)
const currentCourse = ref({})
const videoPlayer = ref(null)

// 当前视频
const currentVideo = computed(() => {
  return videos.value[currentIndex.value] || null
})

// 获取视频URL（支持多种字段名）
const getVideoUrl = (video) => {
  if (!video) return ''

  console.log('🔍 获取视频URL，视频数据:', video)
  console.log('🔍 可用字段:', Object.keys(video))

  // 尝试多个可能的字段名
  const url = video.url ||
              video.videoUrl ||
              video.video_url ||
              video.videoPath ||
              video.video_path ||
              video.src ||
              video.video ||
              video.playUrl ||
              video.fileUrl ||
              video.file_path ||
              ''

  // 如果URL是相对路径，拼接完整的服务器地址
  let fullUrl = url
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = `http://${API_IP}:${API_PORT}/${url}`
  }

  console.log('🎬 最终视频URL:', fullUrl)

  return fullUrl
}

// 获取视频时长（支持多种字段名）
const getVideoDuration = (video) => {
  if (!video) return ''

  // 尝试多个可能的字段名
  const duration = video.duration ||
                  video.videoDuration ||
                  video.time ||
                  video.length ||
                  ''

  // 如果是秒数，转换为分:秒格式
  if (typeof duration === 'number') {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return duration
}

// 获取课程视频列表
const fetchVideos = async () => {
  loading.value = true
  try {
    console.log('🎬 获取课程视频列表，课程ID:', courseId.value)

    const response = await courseApi.getCourseVideos(courseId.value)
    console.log('📝 课程视频列表响应:', response)
    console.log('📋 响应数据类型:', Array.isArray(response) ? '数组' : typeof response)

    // 处理响应数据 - 支持直接数组和标准格式
    if (Array.isArray(response)) {
      // 直接返回数组格式
      videos.value = response
      console.log('✅ 获取视频列表成功（数组格式）:', videos.value.length, '个视频')
    } else if (response && (response.code === 200 || response.code === 0)) {
      // 标准格式 {code, data, ...}
      videos.value = response.data || response.videos || []
      currentCourse.value = response.course || {}
      console.log('✅ 获取视频列表成功（标准格式）:', videos.value.length, '个视频')
    } else if (response && response.data && Array.isArray(response.data)) {
      // 另一种格式 {data: [...]}
      videos.value = response.data
      console.log('✅ 获取视频列表成功（data字段格式）:', videos.value.length, '个视频')
    } else {
      ElMessage.error('获取视频列表失败：数据格式异常')
      console.error('❌ 获取视频列表失败，数据格式异常:', response)
      throw new Error('数据格式异常')
    }

    if (videos.value.length > 0) {
      console.log('📋 视频数据示例:', videos.value[0])
      console.log('📋 视频字段:', Object.keys(videos.value[0]))
    }

    // 恢复上次观看位置
    if (videos.value.length > 0) {
      const lastWatched = localStorage.getItem(`lastWatched_${courseId.value}`)
      if (lastWatched) {
        const lastIndex = videos.value.findIndex(v => v.id === lastWatched)
        if (lastIndex !== -1) {
          currentIndex.value = lastIndex
          console.log('📍 恢复上次观看位置:', lastIndex)
        }
      }
    }
  } catch (error) {
    console.error('❌ 获取视频列表失败:', error)
    console.error('❌ 错误详情:', error.message)
    ElMessage.error(`获取视频列表失败: ${error.message}`)

    // 使用模拟数据
    videos.value = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      title: `课程视频 ${i + 1} - ${['课程介绍', '基础知识', '进阶内容', '实战案例', '总结回顾'][i]}`,
      url: '',
      duration: `${10 + i * 5}:00`,
      completed: false
    }))
    currentCourse.value = {
      title: '示例课程'
    }
  } finally {
    loading.value = false
  }
}

// 选择视频
const selectVideo = (index) => {
  currentIndex.value = index
  // 保存观看进度
  localStorage.setItem(`lastWatched_${courseId.value}`, videos.value[index].id)

  // 滚动到视频播放器
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 上一个视频
const previousVideo = () => {
  if (currentIndex.value > 0) {
    selectVideo(currentIndex.value - 1)
  }
}

// 下一个视频
const nextVideo = () => {
  if (currentIndex.value < videos.value.length - 1) {
    selectVideo(currentIndex.value + 1)
  }
}

// 视频播放结束
const handleVideoEnd = () => {
  ElMessage.success('视频播放完成')
  markAsCompleted()
}

// 标记为已学完
const markAsCompleted = () => {
  if (currentVideo.value) {
    currentVideo.value.completed = true
    ElMessage.success('已标记为学完')

    // 自动播放下一个视频
    if (currentIndex.value < videos.value.length - 1) {
      setTimeout(() => {
        nextVideo()
      }, 1000)
    }
  }
}

// 视频时间更新（保存观看进度）
const handleTimeUpdate = () => {
  if (videoPlayer.value && currentVideo.value) {
    const progress = videoPlayer.value.currentTime
    const duration = videoPlayer.value.duration

    if (duration > 0) {
      const percent = (progress / duration) * 100
      // 每10秒保存一次进度
      if (Math.floor(progress) % 10 === 0) {
        localStorage.setItem(`videoProgress_${courseId.value}_${currentVideo.value.id}`, progress)
      }
    }
  }
}

// 格式化时长
const formatDuration = (duration) => {
  if (!duration) return '--:--'
  return duration
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  if (!courseId.value) {
    ElMessage.error('缺少课程ID')
    goBack()
    return
  }
  fetchVideos()
})
</script>

<style lang="scss" scoped>
.video-learning-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.video-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.video-player-section {
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;

  .course-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .video-title-area {
    flex: 1;
    margin: 0 16px;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .video-progress {
    font-size: 14px;
    color: #909399;
    background: #f5f7fa;
    padding: 6px 12px;
    border-radius: 20px;
  }
}

.video-player {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  margin-bottom: 20px;

  video {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.video-url-warning {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 243, 224, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  color: #e6a23c;
  font-size: 16px;
  z-index: 10;

  .el-icon {
    font-size: 48px;
  }
}

.video-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
}

.video-list-section {
  background: #fafbfc;
  border-left: 1px solid #eee;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: white;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.video-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.video-item {
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    background: #f5f7fa;
    transform: translateX(4px);
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .video-item-info {
      .video-item-title {
        color: white;
      }

      .video-item-meta {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  &.completed {
    .video-item-number {
      background: #67c23a;
      color: white;
    }
  }
}

.video-item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.video-item-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #606266;
}

.video-item-info {
  flex: 1;
  min-width: 0;
}

.video-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .completed-tag {
    color: #67c23a;
  }
}

.playing-icon {
  flex-shrink: 0;
  font-size: 20px;
  color: #409eff;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .video-wrapper {
    grid-template-columns: 1fr;
  }

  .video-list-section {
    border-left: none;
    border-top: 1px solid #eee;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .video-learning-container {
    padding: 10px;
  }

  .video-player-section {
    padding: 16px;
  }

  .video-header {
    .course-title {
      font-size: 18px;
    }
  }

  .video-controls {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
