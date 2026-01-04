import axios from 'axios'
import router from '@/router'
import { API_CONFIG, API_IP, API_PORT } from '@/config/api'

// 创建axios实例（包含 /api/student 路径）
const request = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 创建不需要token验证的axios实例（用于验证码等接口）
const noTokenRequest = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 创建通用API实例（不包含 /student 路径）
const commonRequest = axios.create({
  baseURL: `http://${API_IP}:${API_PORT}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// noTokenRequest响应拦截器
noTokenRequest.interceptors.response.use(
  response => {
    // 检查响应数据格式
    const data = response.data
    console.log('🔍 noTokenRequest响应拦截器收到数据:', JSON.stringify(data, null, 2))
    
    // 如果返回的是标准格式 {code, message, data, errors}
    if (data && typeof data === 'object' && 'code' in data) {
      console.log('📋 noTokenRequest标准格式响应，code:', data.code, 'message:', data.message)
      
      // 成功码判断
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(data.code)) {
        console.log('✅ noTokenRequest成功响应，code:', data.code)
      } else {
        console.log('❌ noTokenRequest失败响应，code:', data.code, 'message:', data.message)
      }
    } else {
      console.log('📄 noTokenRequest非标准格式响应')
    }
    
    // 正常响应或非标准格式，直接返回
    return data
  },
  error => {
    console.log('🚨 noTokenRequest HTTP错误:', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

// commonRequest请求拦截器
commonRequest.interceptors.request.use(
  async (config) => {
    // 如果是FormData，不要设置Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    // 打印请求信息
    console.log('📡 发送commonRequest请求:', {
      url: config.baseURL + config.url,
      method: config.method,
      data: config.data instanceof FormData ? 'FormData (文件数据)' : config.data
    })

    // 添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 commonRequest已添加Authorization头')
    }

    return config
  },
  error => Promise.reject(error)
)

// commonRequest响应拦截器
commonRequest.interceptors.response.use(
  response => {
    const data = response.data
    console.log('📡 commonRequest响应:', data)

    // 支持标准格式和直接数组格式
    return data
  },
  error => {
    console.log('🚨 commonRequest HTTP错误:', error.response?.status, error.message)

    // 401错误处理
    if (error.response?.status === 401) {
      console.log('🔒 commonRequest收到401错误')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isAuthenticated')

      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login') {
        router.push('/login')
      }
    }

    return Promise.reject(error)
  }
)

// 获取初始token的函数（用于开发/测试）
const getInitialToken = async () => {
  try {
    // 检查localStorage中是否有token
    const token = localStorage.getItem('token')
    if (token) {
      console.log('🔑 从localStorage获取到token')
      return token
    }
    
    console.log('🔑 localStorage中没有找到token')
    return null
  } catch (error) {
    console.error('🚨 获取初始token失败:', error)
    return null
  }
}

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 如果是FormData，不要设置Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // 打印请求信息
    console.log('发送请求:', {
      url: config.baseURL + config.url,
      method: config.method,
      data: config.data instanceof FormData ? 'FormData (文件数据)' : config.data,
      headers: config.headers,
      contentType: config.headers['Content-Type']
    })
    
    let token = localStorage.getItem('token')
    
    // 如果没有token，尝试获取初始token（不进行刷新，避免500错误）
    if (!token) {
      token = await getInitialToken()
    }
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 已添加Authorization头:', `Bearer ${token.substring(0, 20)}...`)
    } else {
      console.log('⚠️ 没有有效的token，请求可能会失败')
      
      // 对于需要认证的API，记录警告但继续执行
      if (config.url.includes('/courses/recommended') || config.url.includes('/user')) {
        console.warn('🚨 需要认证的API缺少token:', config.url)
        console.log('⚠️ 请求将继续执行，但可能会因认证失败而被拒绝')
      }
    }
    
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 检查响应数据格式
    const data = response.data
    console.log('🔍 响应拦截器收到数据:', JSON.stringify(data, null, 2))
    
    // 如果返回的是标准格式 {code, message, data, errors}
    if (data && typeof data === 'object' && 'code' in data) {
      console.log('📋 标准格式响应，code:', data.code, 'message:', data.message)
      
      // 如果是401错误，不要在拦截器中处理，让业务逻辑处理
      if (data.code === 401) {
        console.log('⚠️ 401错误，返回业务逻辑处理')
        return data  // 直接返回，让login组件处理
      }
      
      // 对于其他错误码，也直接返回，让业务逻辑判断
      if (data.code !== 200 && data.code !== 0) {
        console.log('❌ 非200/0错误码，返回业务逻辑处理')
        return data  // 直接返回，让业务逻辑处理
      }
      
      console.log('✅ 成功响应，code:', data.code)
    } else {
      console.log('📄 非标准格式响应')
    }
    
    // 正常响应或非标准格式，直接返回
    return data
  },
  async error => {
    console.log('🚨 HTTP错误:', error.response?.status, error.message)

    // 只处理HTTP层面的错误（网络错误、服务器错误等）
    if (error.response?.status === 401) {
      // 401错误，清除认证信息并跳转到登录页（不进行token刷新）
      console.log('🔒 收到401错误，清除认证信息')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isAuthenticated')

      // 只有在非登录页面时才跳转到登录页
      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login') {
        console.log('📍 跳转到登录页')
        router.push('/login')
      }
    } else if (error.response?.status === 500) {
      // 500错误通常表示服务器内部问题
      console.warn('⚠️ 服务器500错误')
    }
    return Promise.reject(error)
  }
)

export default request
export { noTokenRequest, commonRequest }