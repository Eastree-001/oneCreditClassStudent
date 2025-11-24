<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧装饰区域 -->
      <div class="login-left">
        <div class="left-content">
          <div class="logo-section">
            <el-icon :size="48" color="white">
              <School />
            </el-icon>
            <h1 class="logo-title">EduNexus</h1>
            <p class="logo-subtitle">一学分课堂学生端</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon :size="24" color="white"><Document /></el-icon>
              <span>丰富的课程资源</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="white"><DataAnalysis /></el-icon>
              <span>实时学习进度跟踪</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="white"><Briefcase /></el-icon>
              <span>企业项目实训</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录/注册表单区域 -->
      <div class="login-right">
        <div class="form-container">
          <!-- 切换标签 -->
          <div class="tab-switch">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              登录
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              注册
            </div>
          </div>

          <!-- 登录表单 -->
          <div v-show="activeTab === 'login'" class="form-content">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录您的账户以继续学习</p>

            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名或学号"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleLogin"
                />
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>

              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="loginLoading"
                @click="handleLogin"
              >
                {{ loginLoading ? '登录中...' : '登录' }}
              </el-button>
            </el-form>
          </div>

          <!-- 注册表单 -->
          <div v-show="activeTab === 'register'" class="form-content">
            <h2 class="form-title">创建账户</h2>
            <p class="form-subtitle">注册新账户开始学习之旅</p>

            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              class="register-form"
            >
              <el-form-item prop="studentId">
                <el-input
                  v-model="registerForm.studentId"
                  placeholder="请输入学号"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                  :prefix-icon="Message"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleRegister"
                />
              </el-form-item>

              <el-form-item prop="agreement">
                <el-checkbox v-model="registerForm.agreement">
                  我已阅读并同意
                  <el-link type="primary" :underline="false">《用户协议》</el-link>
                  和
                  <el-link type="primary" :underline="false">《隐私政策》</el-link>
                </el-checkbox>
              </el-form-item>

              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="registerLoading"
                @click="handleRegister"
              >
                {{ registerLoading ? '注册中...' : '注册' }}
              </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  School,
  User,
  Lock,
  Message,
  Document,
  DataAnalysis,
  Briefcase
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'

const router = useRouter()

const activeTab = ref('login')
const rememberMe = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  studentId: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证协议
const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请先阅读并同意用户协议'))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或学号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '学号只能包含数字', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loginLoading.value = true
      // 模拟登录请求
      setTimeout(() => {
        loginLoading.value = false
        // 设置登录状态
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('username', loginForm.username)
        ElMessage.success('登录成功')
        // 跳转到首页
        router.push('/home')
      }, 1000)
    } else {
      ElMessage.error('请填写完整的登录信息')
    }
  })
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate((valid) => {
    if (valid) {
      registerLoading.value = true
      // 模拟注册请求
      setTimeout(() => {
        registerLoading.value = false
        ElMessage.success('注册成功，请登录')
        // 切换到登录标签
        activeTab.value = 'login'
        // 清空注册表单
        Object.assign(registerForm, {
          studentId: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          agreement: false
        })
        // 填充用户名到登录表单
        loginForm.username = registerForm.username
      }, 1000)
    } else {
      ElMessage.error('请填写完整的注册信息')
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(118, 175, 255, 0.1) 0%, rgba(0, 99, 221, 0.1) 100%);
  position: relative;
  overflow: hidden;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(118, 175, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

.login-wrapper {
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-left {
  flex: 1;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('@/img/jimeng-2025-11-04-5365-现代简约风格，以渐变蓝色为主色调，从浅蓝到深蓝的柔和渐变，画面左侧有一个年轻亚洲....png');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
    z-index: 0;
  }

  .left-content {
    position: relative;
    z-index: 1;
    color: white;
    width: 100%;
    max-width: 400px;

    .logo-section {
      text-align: center;
      margin-bottom: 60px;

      .logo-title {
        font-size: 48px;
        font-weight: 700;
        margin: 20px 0 10px 0;
        letter-spacing: 2px;
      }

      .logo-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(10px);
        }
      }
    }
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;

  .form-container {
    width: 100%;
    max-width: 420px;

    .tab-switch {
      display: flex;
      gap: 8px;
      margin-bottom: 40px;
      background: $bg-color;
      padding: 4px;
      border-radius: 12px;

      .tab-item {
        flex: 1;
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        color: $text-regular;
        transition: all 0.3s;

        &:hover {
          color: $primary-color;
        }

        &.active {
          background: white;
          color: $primary-color;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .form-content {
      .form-title {
        font-size: 28px;
        font-weight: 700;
        color: $text-primary;
        margin: 0 0 8px 0;
      }

      .form-subtitle {
        font-size: 14px;
        color: $text-secondary;
        margin: 0 0 32px 0;
      }

      .login-form,
      .register-form {
        :deep(.el-form-item) {
          margin-bottom: 24px;
        }

        :deep(.el-input__wrapper) {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

          &:hover {
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
          }
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          background: $gradient-primary;
          border: none;
          margin-top: 8px;

          &:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 968px) {
  .login-wrapper {
    flex-direction: column;
    height: auto;
    max-height: none;
  }

  .login-left {
    flex: none;
    min-height: 300px;
    padding: 40px 20px;

    .left-content {
      .logo-section {
        margin-bottom: 30px;

        .logo-title {
          font-size: 36px;
        }
      }

      .feature-list {
        gap: 16px;

        .feature-item {
          font-size: 14px;
          padding: 12px;
        }
      }
    }
  }

  .login-right {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }

  .login-wrapper {
    border-radius: 16px;
  }

  .login-left {
    min-height: 250px;
    padding: 30px 20px;

    .left-content {
      .logo-section {
        .logo-title {
          font-size: 28px;
        }

        .logo-subtitle {
          font-size: 14px;
        }
      }

      .feature-list {
        .feature-item {
          font-size: 12px;
          padding: 10px;
        }
      }
    }
  }
}
</style>

