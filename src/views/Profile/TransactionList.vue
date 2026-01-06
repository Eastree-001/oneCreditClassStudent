<template>
  <div class="transaction-list">
    <el-empty v-if="transactions.length === 0" description="暂无交易记录" :image-size="100" />
    <div v-else class="transaction-items">
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="transaction-item"
      >
        <div class="transaction-icon" :class="getTransactionTypeClass(transaction.transactionType)">
          <el-icon :size="20">
            <Money v-if="transaction.transactionType === 'EARN'" />
            <Wallet v-else-if="transaction.transactionType === 'EXCHANGE'" />
            <Remove v-else />
          </el-icon>
        </div>
        <div class="transaction-content">
          <div class="transaction-header">
            <span class="transaction-desc">{{ transaction.description || getTransactionTypeText(transaction.transactionType) }}</span>
            <span class="transaction-amount" :class="getAmountClass(transaction.transactionType)">
              {{ getAmountPrefix(transaction.transactionType) }}{{ transaction.amount }}
            </span>
          </div>
          <div class="transaction-meta">
            <span class="transaction-time">{{ formatTime(transaction.createdAt) }}</span>
            <span class="transaction-balance">余额：{{ transaction.balanceAfter }}</span>
            <el-tag v-if="transaction.rmbAmount" size="small" type="success">
              兑换¥{{ transaction.rmbAmount }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    <div v-if="hasMore" class="load-more">
      <el-button @click="$emit('load-more')" :loading="loading" text>
        加载更多
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Money, Wallet, Remove } from '@element-plus/icons-vue'

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['load-more'])

const getTransactionTypeClass = (type) => {
  const map = {
    'EARN': 'type-earn',
    'EXCHANGE': 'type-exchange',
    'DEDUCT': 'type-deduct'
  }
  return map[type] || ''
}

const getTransactionTypeText = (type) => {
  const map = {
    'EARN': '获得佣金币',
    'EXCHANGE': '兑换佣金币',
    'DEDUCT': '扣除佣金币'
  }
  return map[type] || type
}

const getAmountPrefix = (type) => {
  if (type === 'EARN') return '+'
  if (type === 'EXCHANGE' || type === 'DEDUCT') return '-'
  return ''
}

const getAmountClass = (type) => {
  if (type === 'EARN') return 'amount-earn'
  if (type === 'EXCHANGE' || type === 'DEDUCT') return 'amount-deduct'
  return ''
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.transaction-list {
  .transaction-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .transaction-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: $bg-color;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background: darken($bg-color, 2%);
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.type-earn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.type-exchange {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.type-deduct {
        background: #f56c6c;
        color: white;
      }
    }

    .transaction-content {
      flex: 1;
      min-width: 0;

      .transaction-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .transaction-desc {
          font-size: 14px;
          color: $text-primary;
          font-weight: 500;
        }

        .transaction-amount {
          font-size: 16px;
          font-weight: 600;

          &.amount-earn {
            color: #67c23a;
          }

          &.amount-deduct {
            color: #f56c6c;
          }
        }
      }

      .transaction-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: $text-secondary;

        .transaction-balance {
          margin-left: auto;
        }
      }
    }
  }

  .load-more {
    text-align: center;
    margin-top: 20px;
  }
}
</style>

