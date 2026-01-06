<template>
  <div class="exchange-application-list">
    <el-empty v-if="applications.length === 0" description="暂无兑换申请" :image-size="100" />
    <div v-else class="application-items">
      <el-card
        v-for="app in applications"
        :key="app.id"
        class="application-item"
        shadow="hover"
      >
        <div class="application-header">
          <div class="application-info">
            <div class="application-amount">
              <span class="coins">{{ app.coinsAmount }}</span>
              <span class="unit">佣金币</span>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              <span class="rmb">¥{{ app.rmbAmount }}</span>
            </div>
            <div class="application-meta">
              <el-tag :type="getStatusType(app.status)" size="small">
                {{ getStatusText(app.status) }}
              </el-tag>
              <span class="create-time">{{ formatTime(app.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="application-details">
          <div class="detail-row">
            <span class="label">收款方式：</span>
            <span class="value">{{ getPaymentMethodText(app.paymentMethod) }}</span>
          </div>
          <div class="detail-row" v-if="app.paymentMethod === 'ALIPAY' && app.alipayAccount">
            <span class="label">支付宝账号：</span>
            <span class="value">{{ app.alipayAccount }}</span>
          </div>
          <div class="detail-row" v-if="app.paymentMethod === 'WECHAT' && app.wechatAccount">
            <span class="label">微信账号：</span>
            <span class="value">{{ app.wechatAccount }}</span>
          </div>
          <div class="detail-row" v-if="app.paymentMethod === 'BANK'">
            <span class="label">银行信息：</span>
            <span class="value">{{ app.bankName }} {{ app.bankAccount }} ({{ app.accountHolder }})</span>
          </div>
          <div class="detail-row" v-if="app.reviewComment">
            <span class="label">审核意见：</span>
            <span class="value">{{ app.reviewComment }}</span>
          </div>
          <div class="detail-row" v-if="app.reviewedAt">
            <span class="label">审核时间：</span>
            <span class="value">{{ formatTime(app.reviewedAt) }}</span>
          </div>
          <div class="detail-row" v-if="app.completedAt">
            <span class="label">完成时间：</span>
            <span class="value">{{ formatTime(app.completedAt) }}</span>
          </div>
        </div>

        <div class="application-actions" v-if="app.status === 'PENDING'">
          <el-button size="small" @click="handleCancel(app)">
            <el-icon><CircleClose /></el-icon>
            取消申请
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, CircleClose } from '@element-plus/icons-vue'
import { userApi } from '@/api'

const props = defineProps({
  applications: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const getStatusType = (status) => {
  const map = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'COMPLETED': 'success',
    'REJECTED': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'COMPLETED': '已完成',
    'REJECTED': '已拒绝'
  }
  return map[status] || status
}

const getPaymentMethodText = (method) => {
  const map = {
    'ALIPAY': '支付宝',
    'WECHAT': '微信',
    'BANK': '银行转账'
  }
  return map[method] || method
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCancel = async (app) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消兑换申请吗？取消后将无法恢复。`,
      '确认取消',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留',
        type: 'warning'
      }
    )

    const response = await userApi.cancelExchangeApplication(app.id)
    if (response && response.code === 200) {
      ElMessage.success('已取消兑换申请')
      emit('refresh')
    } else {
      ElMessage.error(response?.message || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消兑换申请失败:', error)
      ElMessage.error('取消失败，请稍后重试')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.exchange-application-list {
  .application-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .application-item {
    border: none;

    .application-header {
      margin-bottom: 16px;

      .application-info {
        .application-amount {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 20px;
          font-weight: 600;

          .coins {
            color: $primary-color;
          }

          .unit {
            font-size: 14px;
            color: $text-secondary;
            font-weight: normal;
          }

          .arrow-icon {
            color: $text-secondary;
            margin: 0 4px;
          }

          .rmb {
            color: #f56c6c;
          }
        }

        .application-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .create-time {
            font-size: 12px;
            color: $text-secondary;
          }
        }
      }
    }

    .application-details {
      padding: 12px;
      background: $bg-color;
      border-radius: 6px;
      margin-bottom: 12px;

      .detail-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: $text-secondary;
          min-width: 100px;
        }

        .value {
          color: $text-primary;
          flex: 1;
        }
      }
    }

    .application-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid $border-color;
    }
  }
}
</style>

