<template>
  <div class="teacher-application">
    <div class="page-header">
      <h1><el-icon :size="28"><User /></el-icon>教师入驻</h1>
      <p class="subtitle">成功考研学生可申请成为平台教师</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card class="application-card">
          <template #header>申请表单</template>
          <el-form :model="applicationForm" label-width="120px">
            <el-form-item label="考研成绩">
              <el-input-number v-model="applicationForm.score" :min="0" :max="500" />
            </el-form-item>
            <el-form-item label="录取院校">
              <el-input v-model="applicationForm.university" />
            </el-form-item>
            <el-form-item label="专业">
              <el-input v-model="applicationForm.major" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="applicationForm.bio" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交申请</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="status-card">
          <template #header>申请状态</template>
          <div class="status-content">
            <el-tag :type="statusType" size="large">{{ statusText }}</el-tag>
            <p v-if="applicationStatus.note">{{ applicationStatus.note }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { User } from '@element-plus/icons-vue'
import { postgraduateApi } from '@/api'
import { ElMessage } from 'element-plus'

const applicationForm = ref({
  score: 0,
  university: '',
  major: '',
  bio: ''
})

const applicationStatus = ref({
  status: 'pending',
  note: ''
})

const statusType = computed(() => {
  const map = { pending: 'info', approved: 'success', rejected: 'danger' }
  return map[applicationStatus.value.status] || 'info'
})

const statusText = computed(() => {
  const map = { pending: '审核中', approved: '已通过', rejected: '已拒绝' }
  return map[applicationStatus.value.status] || '未申请'
})

const handleSubmit = async () => {
  try {
    await postgraduateApi.applyAsTeacher(applicationForm.value)
    ElMessage.success('申请提交成功，请等待审核')
    loadStatus()
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const loadStatus = async () => {
  try {
    const response = await postgraduateApi.getApplicationStatus()
    if (response?.data) {
      applicationStatus.value = response.data
    }
  } catch (error) {
    console.error('加载状态失败:', error)
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<style lang="scss" scoped>
.teacher-application {
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
}
</style>

