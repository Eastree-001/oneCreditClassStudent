<template>
  <div class="recruitment-container">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">企业直聘</h1>
          <p class="page-desc">为学生提供直接入职的渠道，找到心仪的工作机会</p>
        </div>
        <div class="header-actions">
          <el-button 
            :type="showMyApplications ? 'default' : 'primary'" 
            @click="handleShowAllRecruitments"
          >
            <el-icon><Briefcase /></el-icon>
            全部职位
          </el-button>
          <el-button 
            :type="showMyApplications ? 'primary' : 'default'" 
            @click="handleShowMyApplications"
          >
            <el-icon><User /></el-icon>
            我的申请
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="工作地点">
          <el-select v-model="filterForm.location" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="广州" value="广州" />
            <el-option label="深圳" value="深圳" />
            <el-option label="杭州" value="杭州" />
            <el-option label="成都" value="成都" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="学历要求">
          <el-select v-model="filterForm.education" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="专科" value="专科" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <template v-if="!showMyApplications">
              <el-option label="招聘中" value="招聘中" />
              <el-option label="已结束" value="已结束" />
            </template>
            <template v-else>
              <el-option label="待审核" value="待审核" />
              <el-option label="已通过" value="已通过" />
              <el-option label="已拒绝" value="已拒绝" />
              <el-option label="已录用" value="已录用" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            :placeholder="showMyApplications ? '搜索我的申请' : '搜索岗位名称'"
            clearable
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 职位列表 -->
    <div v-loading="loading" class="recruitments-grid">
      <el-card
        v-for="recruitment in paginatedRecruitments"
        :key="recruitment.id"
        class="recruitment-card"
        shadow="hover"
      >
        <div class="recruitment-header">
          <div class="recruitment-title-section">
            <h3 class="recruitment-title">{{ recruitment.title }}</h3>
            <el-tag :type="getStatusType(recruitment.status)" size="small">
              {{ recruitment.status }}
            </el-tag>
          </div>
        </div>

        <div class="recruitment-content">
          <div class="recruitment-info">
            <div class="info-row">
              <div class="info-item">
                <el-icon><Briefcase /></el-icon>
                <span>{{ recruitment.positionName }}</span>
              </div>
              <div class="info-item">
                <el-icon><Location /></el-icon>
                <span>{{ recruitment.location }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <el-icon><Money /></el-icon>
                <span>{{ recruitment.salaryRange }}</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>需求{{ recruitment.requiredNumber }}人</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <el-icon><Reading /></el-icon>
                <span>{{ recruitment.educationRequirement }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>截止：{{ recruitment.deadline }}</span>
              </div>
            </div>
          </div>

          <div class="recruitment-stats">
            <span class="stat-item">
              <el-icon><UserFilled /></el-icon>
              {{ recruitment.applicationCount || 0 }}人申请
            </span>
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ recruitment.viewCount || 0 }}次浏览
            </span>
          </div>

          <div class="recruitment-footer">
            <el-button @click="handleViewDetail(recruitment)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button
              type="primary"
              @click="handleApply(recruitment)"
              :disabled="recruitment.status !== '招聘中' || showMyApplications"
            >
              <el-icon><CircleCheck /></el-icon>
              {{ recruitment.status === '招聘中' ? '立即申请' : '已结束' }}
            </el-button>
            <el-button
              v-if="showMyApplications && (recruitment.applicationStatus === '待审核' || recruitment.applicationStatus === '申请中')"
              type="danger"
              size="small"
              @click="handleCancelApplication(recruitment)"
              :loading="cancellingApplication && cancellingApplicationId === recruitment.applicationId"
            >
              <el-icon><CircleClose /></el-icon>
              取消申请
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 27, 36]"
        :total="filteredRecruitments.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 职位详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="selectedRecruitment?.title"
      width="900px"
      @close="handleCloseDetail"
    >
      <div v-if="selectedRecruitment" class="recruitment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="需求标题" :span="2">
            {{ selectedRecruitment.title }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecruitment.status)">
              {{ selectedRecruitment.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="岗位名称">
            {{ selectedRecruitment.positionName }}
          </el-descriptions-item>
          <el-descriptions-item label="需求人数">
            {{ selectedRecruitment.requiredNumber }}人
          </el-descriptions-item>
          <el-descriptions-item label="工作地点">
            {{ selectedRecruitment.location }}
          </el-descriptions-item>
          <el-descriptions-item label="薪资范围">
            {{ selectedRecruitment.salaryRange }}
          </el-descriptions-item>
          <el-descriptions-item label="学历要求">
            {{ selectedRecruitment.educationRequirement }}
          </el-descriptions-item>
          <el-descriptions-item label="截止日期">
            {{ selectedRecruitment.deadline }}
          </el-descriptions-item>
          <el-descriptions-item label="岗位描述" :span="2">
            <div class="description-content">{{ selectedRecruitment.description || '暂无描述' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="技能要求" :span="2">
            <div v-if="selectedRecruitment.skills && selectedRecruitment.skills.length > 0">
              <el-tag
                v-for="skill in selectedRecruitment.skills"
                :key="skill"
                size="small"
                class="skill-tag"
              >
                {{ skill }}
              </el-tag>
            </div>
            <span v-else class="no-data">暂无技能要求</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请人数">
            {{ selectedRecruitment.applicationCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="浏览次数">
            {{ selectedRecruitment.viewCount || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="发布天数">
            {{ selectedRecruitment.publishedDays || 0 }}天
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedRecruitment.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ selectedRecruitment.updatedAt ? formatDateTime(selectedRecruitment.updatedAt) : '暂无更新' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="handleApplyFromDetail"
          :disabled="selectedRecruitment?.status !== '招聘中'"
          v-if="!showMyApplications"
        >
          立即申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 申请对话框 -->
    <el-dialog
      v-model="applyDialogVisible"
      title="申请职位"
      width="600px"
    >
      <el-form
        v-if="selectedRecruitment"
        :model="applyForm"
        :rules="applyRules"
        ref="applyFormRef"
        label-width="100px"
      >
        <el-form-item label="职位名称">
          <el-input v-model="selectedRecruitment.title" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="applyForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="applyForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="applyForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="applyForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="个人简历" prop="resume">
          <el-input
            v-model="applyForm.resume"
            type="textarea"
            :rows="6"
            placeholder="请简要介绍您的教育背景、工作经历、技能特长等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApply" :loading="submitting">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  View,
  CircleCheck,
  CircleClose,
  Briefcase,
  Location,
  Money,
  User,
  UserFilled,
  Reading,
  Calendar
} from '@element-plus/icons-vue'
import { recruitmentApi, userApi } from '@/api'

const filterForm = ref({
  location: '',
  education: '',
  status: '',
  keyword: ''
})

const currentPage = ref(1)
const pageSize = ref(9)
const detailDialogVisible = ref(false)
const applyDialogVisible = ref(false)
const selectedRecruitment = ref(null)
const applyFormRef = ref(null)
const showMyApplications = ref(false)
const myApplications = ref([])
const allRecruitments = ref([])
const loading = ref(false)
const submitting = ref(false)
const cancellingApplication = ref(false)
const cancellingApplicationId = ref(null)

const applyForm = ref({
  name: '',
  studentId: '',
  phone: '',
  email: '',
  resume: ''
})

const applyRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  resume: [{ required: true, message: '请输入个人简历', trigger: 'blur' }]
}

const filteredRecruitments = computed(() => {
  let result = showMyApplications.value ? myApplications.value : allRecruitments.value

  if (filterForm.value.location) {
    result = result.filter(r => r.location === filterForm.value.location)
  }

  if (filterForm.value.education) {
    result = result.filter(r => r.educationRequirement === filterForm.value.education)
  }

  if (filterForm.value.status) {
    if (showMyApplications.value) {
      result = result.filter(r => r.applicationStatus === filterForm.value.status)
    } else {
      result = result.filter(r => r.status === filterForm.value.status)
    }
  }

  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(r =>
      r.title?.toLowerCase().includes(keyword) ||
      r.positionName?.toLowerCase().includes(keyword) ||
      r.description?.toLowerCase().includes(keyword)
    )
  }

  return result
})

const paginatedRecruitments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecruitments.value.slice(start, end)
})

const getStatusType = (status) => {
  const map = {
    '招聘中': 'success',
    '已结束': 'info',
    '待审核': 'warning',
    '已通过': 'success',
    '已拒绝': 'danger',
    '已录用': 'success',
    '申请中': 'info'
  }
  return map[status] || 'info'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    location: '',
    education: '',
    status: '',
    keyword: ''
  }
  currentPage.value = 1
}

const handleShowAllRecruitments = async () => {
  showMyApplications.value = false
  currentPage.value = 1
  filterForm.value = {
    location: '',
    education: '',
    status: '',
    keyword: ''
  }
  await loadRecruitments()
}

const handleShowMyApplications = async () => {
  showMyApplications.value = true
  currentPage.value = 1
  filterForm.value = {
    location: '',
    education: '',
    status: '',
    keyword: ''
  }
  await loadMyApplications()
}

const loadRecruitments = async () => {
  try {
    loading.value = true
    const response = await recruitmentApi.getRecruitments({
      page: 1,
      pageSize: 1000
    })
    
    if (response && response.code === 200 && response.data) {
      let recruitments = []
      if (Array.isArray(response.data)) {
        recruitments = response.data
      } else if (response.data.list) {
        recruitments = response.data.list
      }
      
      // 计算发布天数
      recruitments = recruitments.map(recruitment => ({
        ...recruitment,
        publishedDays: calculatePublishedDays(recruitment.createdAt)
      }))
      
      allRecruitments.value = recruitments
    }
  } catch (error) {
    console.error('加载职位列表失败:', error)
    ElMessage.error('加载职位列表失败')
  } finally {
    loading.value = false
  }
}

const loadMyApplications = async () => {
  try {
    loading.value = true
    const response = await recruitmentApi.getMyApplications({
      page: 1,
      pageSize: 1000
    })
    
    if (response && response.code === 200 && response.data) {
      let applications = []
      if (Array.isArray(response.data)) {
        applications = response.data
      } else if (response.data.list) {
        applications = response.data.list
      }
      
      // 将申请数据转换为招聘数据格式
      myApplications.value = applications.map(app => ({
        ...app.recruitment,
        applicationId: app.id,
        applicationStatus: app.status
      }))
    }
  } catch (error) {
    console.error('加载我的申请失败:', error)
    ElMessage.error('加载我的申请失败')
  } finally {
    loading.value = false
  }
}

const calculatePublishedDays = (createdAt) => {
  if (!createdAt) return 0
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const handleViewDetail = async (recruitment) => {
  selectedRecruitment.value = recruitment
  detailDialogVisible.value = true
  
  // 增加浏览次数
  try {
    await recruitmentApi.incrementViews(recruitment.id)
    // 更新本地数据
    if (showMyApplications.value) {
      const index = myApplications.value.findIndex(r => r.id === recruitment.id)
      if (index !== -1) {
        myApplications.value[index].viewCount = (myApplications.value[index].viewCount || 0) + 1
      }
    } else {
      const index = allRecruitments.value.findIndex(r => r.id === recruitment.id)
      if (index !== -1) {
        allRecruitments.value[index].viewCount = (allRecruitments.value[index].viewCount || 0) + 1
      }
    }
    selectedRecruitment.value.viewCount = (selectedRecruitment.value.viewCount || 0) + 1
  } catch (error) {
    console.error('增加浏览次数失败:', error)
  }
}

const handleCloseDetail = () => {
  selectedRecruitment.value = null
}

const handleApply = async (recruitment) => {
  selectedRecruitment.value = recruitment
  
  // 获取用户信息
  const userInfo = await getUserInfo()
  
  applyForm.value = {
    name: userInfo?.name || userInfo?.username || '',
    studentId: userInfo?.studentId || '',
    phone: userInfo?.phone || userInfo?.mobile || '',
    email: userInfo?.email || '',
    resume: ''
  }
  
  applyDialogVisible.value = true
}

const handleApplyFromDetail = () => {
  if (selectedRecruitment.value) {
    handleApply(selectedRecruitment.value)
    detailDialogVisible.value = false
  }
}

const getUserInfo = async () => {
  try {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      return JSON.parse(savedUserInfo)
    }
    
    const response = await userApi.getUserInfo()
    if (response && response.code === 200 && response.data) {
      return response.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  return null
}

const handleSubmitApply = async () => {
  if (!applyFormRef.value || !selectedRecruitment.value) {
    ElMessage.error('请选择要申请的职位')
    return
  }

  try {
    await applyFormRef.value.validate()
    
    submitting.value = true
    
    const response = await recruitmentApi.applyRecruitment(selectedRecruitment.value.id, applyForm.value)
    
    if (response && response.code === 200) {
      ElMessage.success('申请提交成功，请等待审核')
      applyDialogVisible.value = false
      applyForm.value = {
        name: '',
        studentId: '',
        phone: '',
        email: '',
        resume: ''
      }
      
      // 刷新数据
      if (showMyApplications.value) {
        await loadMyApplications()
      } else {
        await loadRecruitments()
      }
    } else {
      ElMessage.error(response?.message || '申请失败，请稍后重试')
    }
  } catch (error) {
    if (error !== false) {
      console.error('提交申请失败:', error)
      ElMessage.error(error.message || '申请失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancelApplication = async (recruitment) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消申请"${recruitment.title}"吗？`,
      '确认取消',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '保留',
        type: 'warning'
      }
    )
    
    cancellingApplication.value = true
    cancellingApplicationId.value = recruitment.applicationId
    
    const response = await recruitmentApi.cancelApplication(recruitment.applicationId)
    
    if (response && response.code === 200) {
      ElMessage.success('已取消申请')
      await loadMyApplications()
    } else {
      ElMessage.error(response?.message || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消申请失败:', error)
      ElMessage.error('取消失败，请稍后重试')
    }
  } finally {
    cancellingApplication.value = false
    cancellingApplicationId.value = null
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(async () => {
  await loadRecruitments()
})
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.recruitment-container {
  .page-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

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

    .header-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }
  }

  .filter-card {
    margin-bottom: 20px;
    border: none;

    .filter-form {
      margin: 0;
    }
  }

  .recruitments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .recruitment-card {
      border: none;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .recruitment-header {
        margin-bottom: 16px;

        .recruitment-title-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;

          .recruitment-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0;
            color: $text-primary;
            flex: 1;
          }
        }
      }

      .recruitment-content {
        .recruitment-info {
          margin-bottom: 16px;
          padding: 12px;
          background: $bg-color;
          border-radius: 8px;

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            &:last-child {
              margin-bottom: 0;
            }

            .info-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              color: $text-regular;
              flex: 1;

              .el-icon {
                color: $text-secondary;
              }
            }
          }
        }

        .recruitment-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding-top: 12px;
          border-top: 1px solid $border-color;
          font-size: 12px;
          color: $text-secondary;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .recruitment-footer {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }

  .recruitment-detail {
    :deep(.el-descriptions__label) {
      font-weight: 600;
    }

    .description-content {
      white-space: pre-wrap;
      line-height: 1.8;
      color: $text-regular;
    }

    .skill-tag {
      margin-right: 6px;
      margin-bottom: 6px;
    }

    .no-data {
      color: $text-secondary;
      font-style: italic;
    }
  }
}

@media (max-width: 768px) {
  .recruitment-container {
    .page-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        width: 100%;
        justify-content: center;

        .el-button {
          flex: 1;
        }
      }
    }

    .recruitments-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>

