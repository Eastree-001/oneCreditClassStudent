<template>
  <div class="recommendation-advice">
    <div class="page-header">
      <h1><el-icon :size="28"><InfoFilled /></el-icon>保研建议</h1>
      <p class="subtitle">了解保研政策，制定保研计划</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="16">
        <el-card class="policies-card">
          <template #header>保研政策</template>
          <div class="policies-list">
            <div v-for="policy in policies" :key="policy.id" class="policy-item">
              <h3>{{ policy.title }}</h3>
              <p>{{ policy.content }}</p>
              <div class="policy-meta">
                <el-tag size="small">{{ policy.category }}</el-tag>
                <span>{{ policy.date }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="advice-card">
          <template #header>个人保研评估</template>
          <div class="assessment">
            <div class="assessment-item">
              <div class="item-label">GPA</div>
              <div class="item-value">{{ assessment.gpa }}</div>
            </div>
            <div class="assessment-item">
              <div class="item-label">排名</div>
              <div class="item-value">{{ assessment.rank }}</div>
            </div>
            <el-button type="primary" style="width: 100%; margin-top: 16px">查看详细建议</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

const policies = ref([
  {
    id: 1,
    title: '2024年保研政策解读',
    content: '今年保研政策有所调整，主要变化包括...',
    category: '政策解读',
    date: '2024-12-01'
  }
])

const assessment = ref({
  gpa: '3.8',
  rank: '前10%'
})
</script>

<style lang="scss" scoped>
.recommendation-advice {
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

  .policies-list {
    .policy-item {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
      h3 { margin: 0 0 8px 0; }
      p { color: #606266; margin-bottom: 12px; }
      .policy-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .assessment {
    .assessment-item {
      margin-bottom: 16px;
      .item-label { font-size: 14px; color: #909399; }
      .item-value { font-size: 24px; font-weight: 700; }
    }
  }
}
</style>

