<template>
  <div class="profile-container">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-desc">管理您的账户信息和佣金币</p>
    </div>

    <!-- 用户信息卡片 -->
    <el-card class="user-info-card" shadow="hover">
      <div class="user-info-content">
        <el-avatar :size="80" :src="userInfo.avatar">
          <el-icon :size="40"><User /></el-icon>
        </el-avatar>
        <div class="user-details">
          <h2>{{ userInfo.name || userInfo.username || '用户' }}</h2>
          <p class="user-meta">
            <span v-if="userInfo.studentId">学号：{{ userInfo.studentId }}</span>
            <span v-if="userInfo.email">邮箱：{{ userInfo.email }}</span>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 佣金币统计卡片 -->
    <el-row :gutter="20" class="coins-stats-row">
      <el-col :xs="24" :sm="8">
        <el-card class="coin-stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ coinInfo.commissionCoins || 0 }}</div>
              <div class="stat-label">当前佣金币</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="coin-stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ coinInfo.totalEarnedCoins || 0 }}</div>
              <div class="stat-label">累计获得</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="coin-stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="32"><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ coinInfo.totalExchangedAmount || 0 }}</div>
              <div class="stat-label">累计兑换</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 兑换功能 -->
    <el-card class="exchange-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>佣金币兑换</span>
          <el-button type="primary" @click="showExchangeDialog = true" :disabled="!coinInfo.commissionCoins || coinInfo.commissionCoins <= 0">
            <el-icon><Money /></el-icon>
            立即兑换
          </el-button>
        </div>
      </template>

      <!-- 兑换说明 -->
      <div class="exchange-info">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            <div class="exchange-rate-info">
              <span>当前汇率：1 佣金币 = ¥{{ exchangeRate.rate || 0.1 }}</span>
              <span v-if="exchangeRate.minExchangeAmount">最小兑换：{{ exchangeRate.minExchangeAmount }} 佣金币</span>
              <span v-if="exchangeRate.maxExchangeAmount">最大兑换：{{ exchangeRate.maxExchangeAmount }} 佣金币</span>
            </div>
          </template>
        </el-alert>
      </div>

      <!-- 兑换申请列表 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all">
          <ExchangeApplicationList :applications="allApplications" @refresh="loadExchangeApplications" />
        </el-tab-pane>
        <el-tab-pane label="待审核" name="PENDING">
          <ExchangeApplicationList :applications="pendingApplications" @refresh="loadExchangeApplications" />
        </el-tab-pane>
        <el-tab-pane label="已通过" name="APPROVED">
          <ExchangeApplicationList :applications="approvedApplications" @refresh="loadExchangeApplications" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="COMPLETED">
          <ExchangeApplicationList :applications="completedApplications" @refresh="loadExchangeApplications" />
        </el-tab-pane>
        <el-tab-pane label="已拒绝" name="REJECTED">
          <ExchangeApplicationList :applications="rejectedApplications" @refresh="loadExchangeApplications" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 交易记录 -->
    <el-card class="transactions-card" shadow="never">
      <template #header>
        <span>交易记录</span>
      </template>
      <TransactionList :transactions="transactions" @load-more="loadMoreTransactions" :has-more="hasMoreTransactions" />
    </el-card>

    <!-- 兑换对话框 -->
    <el-dialog
      v-model="showExchangeDialog"
      title="申请兑换佣金币"
      width="600px"
      @close="resetExchangeForm"
    >
      <el-form
        :model="exchangeForm"
        :rules="exchangeRules"
        ref="exchangeFormRef"
        label-width="120px"
      >
        <el-form-item label="当前余额">
          <el-input :value="coinInfo.commissionCoins || 0" disabled>
            <template #suffix>佣金币</template>
          </el-input>
        </el-form-item>
        <el-form-item label="兑换数量" prop="coinsAmount">
          <el-input-number
            v-model="exchangeForm.coinsAmount"
            :min="exchangeRate.minExchangeAmount || 10"
            :max="Math.min(exchangeRate.maxExchangeAmount || 1000, coinInfo.commissionCoins || 0)"
            :precision="2"
            :step="10"
            style="width: 100%"
            placeholder="请输入兑换数量"
          >
            <template #suffix>佣金币</template>
          </el-input-number>
          <div class="form-tip">
            可兑换人民币：¥{{ calculatedRmbAmount.toFixed(2) }}
          </div>
        </el-form-item>
        <el-form-item label="收款方式" prop="paymentMethod">
          <el-radio-group v-model="exchangeForm.paymentMethod">
            <el-radio label="ALIPAY">支付宝</el-radio>
            <el-radio label="WECHAT">微信</el-radio>
            <el-radio label="BANK">银行转账</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 支付宝 -->
        <template v-if="exchangeForm.paymentMethod === 'ALIPAY'">
          <el-form-item label="支付宝账号" prop="alipayAccount">
            <el-input v-model="exchangeForm.alipayAccount" placeholder="请输入支付宝账号" />
          </el-form-item>
        </template>

        <!-- 微信 -->
        <template v-if="exchangeForm.paymentMethod === 'WECHAT'">
          <el-form-item label="微信账号" prop="wechatAccount">
            <el-input v-model="exchangeForm.wechatAccount" placeholder="请输入微信账号" />
          </el-form-item>
        </template>

        <!-- 银行转账 -->
        <template v-if="exchangeForm.paymentMethod === 'BANK'">
          <el-form-item label="银行名称" prop="bankName">
            <el-input v-model="exchangeForm.bankName" placeholder="请输入银行名称" />
          </el-form-item>
          <el-form-item label="银行账号" prop="bankAccount">
            <el-input v-model="exchangeForm.bankAccount" placeholder="请输入银行账号" />
          </el-form-item>
          <el-form-item label="开户人姓名" prop="accountHolder">
            <el-input v-model="exchangeForm.accountHolder" placeholder="请输入开户人姓名" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="showExchangeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitExchange" :loading="submitting">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Money, TrendCharts, Wallet } from '@element-plus/icons-vue'
import { userApi } from '@/api'
import ExchangeApplicationList from './Profile/ExchangeApplicationList.vue'
import TransactionList from './Profile/TransactionList.vue'

const userInfo = ref({})
const coinInfo = ref({
  commissionCoins: 0,
  totalEarnedCoins: 0,
  totalExchangedAmount: 0
})
const exchangeRate = ref({
  rate: 0.1,
  minExchangeAmount: 10,
  maxExchangeAmount: 1000
})

const showExchangeDialog = ref(false)
const exchangeFormRef = ref(null)
const submitting = ref(false)
const activeTab = ref('all')

const exchangeForm = ref({
  coinsAmount: null,
  paymentMethod: 'ALIPAY',
  alipayAccount: '',
  wechatAccount: '',
  bankName: '',
  bankAccount: '',
  accountHolder: ''
})

const exchangeRules = {
  coinsAmount: [
    { required: true, message: '请输入兑换数量', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value || value <= 0) {
          callback(new Error('兑换数量必须大于0'))
        } else if (value < exchangeRate.value.minExchangeAmount) {
          callback(new Error(`最小兑换数量为 ${exchangeRate.value.minExchangeAmount} 佣金币`))
        } else if (value > exchangeRate.value.maxExchangeAmount) {
          callback(new Error(`最大兑换数量为 ${exchangeRate.value.maxExchangeAmount} 佣金币`))
        } else if (value > coinInfo.value.commissionCoins) {
          callback(new Error('兑换数量不能超过当前余额'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  paymentMethod: [
    { required: true, message: '请选择收款方式', trigger: 'change' }
  ],
  alipayAccount: [
    { 
      validator: (rule, value, callback) => {
        if (exchangeForm.value.paymentMethod === 'ALIPAY' && !value) {
          callback(new Error('请输入支付宝账号'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  wechatAccount: [
    { 
      validator: (rule, value, callback) => {
        if (exchangeForm.value.paymentMethod === 'WECHAT' && !value) {
          callback(new Error('请输入微信账号'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  bankName: [
    { 
      validator: (rule, value, callback) => {
        if (exchangeForm.value.paymentMethod === 'BANK' && !value) {
          callback(new Error('请输入银行名称'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  bankAccount: [
    { 
      validator: (rule, value, callback) => {
        if (exchangeForm.value.paymentMethod === 'BANK' && !value) {
          callback(new Error('请输入银行账号'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  accountHolder: [
    { 
      validator: (rule, value, callback) => {
        if (exchangeForm.value.paymentMethod === 'BANK' && !value) {
          callback(new Error('请输入开户人姓名'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

const calculatedRmbAmount = computed(() => {
  if (!exchangeForm.value.coinsAmount) return 0
  return exchangeForm.value.coinsAmount * (exchangeRate.value.rate || 0.1)
})

const allApplications = ref([])
const pendingApplications = computed(() => 
  allApplications.value.filter(app => app.status === 'PENDING')
)
const approvedApplications = computed(() => 
  allApplications.value.filter(app => app.status === 'APPROVED')
)
const completedApplications = computed(() => 
  allApplications.value.filter(app => app.status === 'COMPLETED')
)
const rejectedApplications = computed(() => 
  allApplications.value.filter(app => app.status === 'REJECTED')
)

const transactions = ref([])
const hasMoreTransactions = ref(true)
const transactionPage = ref(1)
const transactionPageSize = ref(20)

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await userApi.getUserInfo()
    if (response && response.code === 200 && response.data) {
      userInfo.value = response.data
      coinInfo.value = {
        commissionCoins: response.data.commissionCoins || 0,
        totalEarnedCoins: response.data.totalEarnedCoins || 0,
        totalExchangedAmount: response.data.totalExchangedAmount || 0
      }
    } else {
      // 从localStorage获取
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        userInfo.value = JSON.parse(savedUserInfo)
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    // 从localStorage获取
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      userInfo.value = JSON.parse(savedUserInfo)
    }
  }
}

// 加载兑换汇率
const loadExchangeRate = async () => {
  try {
    const response = await userApi.getExchangeRate()
    if (response && response.code === 200 && response.data) {
      exchangeRate.value = response.data
    }
  } catch (error) {
    console.error('加载兑换汇率失败:', error)
  }
}

// 加载兑换申请列表
const loadExchangeApplications = async () => {
  try {
    const response = await userApi.getExchangeApplications({
      page: 1,
      pageSize: 100
    })
    if (response && response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        allApplications.value = response.data
      } else if (response.data.list) {
        allApplications.value = response.data.list
      }
    }
  } catch (error) {
    console.error('加载兑换申请列表失败:', error)
  }
}

// 加载交易记录
const loadTransactions = async (page = 1) => {
  try {
    const response = await userApi.getCoinTransactions({
      page,
      pageSize: transactionPageSize.value
    })
    if (response && response.code === 200 && response.data) {
      const data = Array.isArray(response.data) ? response.data : (response.data.list || [])
      if (page === 1) {
        transactions.value = data
      } else {
        transactions.value.push(...data)
      }
      hasMoreTransactions.value = data.length === transactionPageSize.value
    }
  } catch (error) {
    console.error('加载交易记录失败:', error)
  }
}

const loadMoreTransactions = () => {
  if (hasMoreTransactions.value) {
    transactionPage.value++
    loadTransactions(transactionPage.value)
  }
}

// 提交兑换申请
const handleSubmitExchange = async () => {
  if (!exchangeFormRef.value) return

  try {
    await exchangeFormRef.value.validate()
    
    submitting.value = true
    
    const formData = {
      coinsAmount: exchangeForm.value.coinsAmount,
      paymentMethod: exchangeForm.value.paymentMethod
    }
    
    if (exchangeForm.value.paymentMethod === 'ALIPAY') {
      formData.alipayAccount = exchangeForm.value.alipayAccount
    } else if (exchangeForm.value.paymentMethod === 'WECHAT') {
      formData.wechatAccount = exchangeForm.value.wechatAccount
    } else if (exchangeForm.value.paymentMethod === 'BANK') {
      formData.bankName = exchangeForm.value.bankName
      formData.bankAccount = exchangeForm.value.bankAccount
      formData.accountHolder = exchangeForm.value.accountHolder
    }
    
    const response = await userApi.applyExchange(formData)
    
    if (response && response.code === 200) {
      ElMessage.success('兑换申请已提交，请等待审核')
      showExchangeDialog.value = false
      resetExchangeForm()
      await Promise.all([
        loadUserInfo(),
        loadExchangeApplications()
      ])
    } else {
      ElMessage.error(response?.message || '提交失败，请稍后重试')
    }
  } catch (error) {
    if (error !== false) { // 表单验证失败会返回false
      console.error('提交兑换申请失败:', error)
      ElMessage.error(error.message || '提交失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

const resetExchangeForm = () => {
  exchangeForm.value = {
    coinsAmount: null,
    paymentMethod: 'ALIPAY',
    alipayAccount: '',
    wechatAccount: '',
    bankName: '',
    bankAccount: '',
    accountHolder: ''
  }
  if (exchangeFormRef.value) {
    exchangeFormRef.value.clearValidate()
  }
}

const handleTabChange = (tabName) => {
  // Tab切换时不需要额外操作，computed会自动更新
}

onMounted(async () => {
  await Promise.all([
    loadUserInfo(),
    loadExchangeRate(),
    loadExchangeApplications(),
    loadTransactions()
  ])
})
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.profile-container {
  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: $text-primary;
    }

    .page-desc {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }
  }

  .user-info-card {
    margin-bottom: 20px;
    border: none;

    .user-info-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .user-details {
        flex: 1;

        h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: $text-primary;
        }

        .user-meta {
          font-size: 14px;
          color: $text-secondary;
          margin: 0;
          display: flex;
          gap: 20px;
        }
      }
    }
  }

  .coins-stats-row {
    margin-bottom: 20px;

    .coin-stat-card {
      border: none;

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: $text-primary;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .exchange-card {
    margin-bottom: 20px;
    border: none;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .exchange-info {
      margin-bottom: 20px;

      .exchange-rate-info {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
      }
    }
  }

  .transactions-card {
    border: none;
  }

  .form-tip {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 4px;
  }
}

@media (max-width: 768px) {
  .profile-container {
    .coins-stats-row {
      .coin-stat-card {
        margin-bottom: 12px;
      }
    }

    .user-info-card {
      .user-info-content {
        flex-direction: column;
        text-align: center;
      }
    }
  }
}
</style>

