// 400错误调试工具
import { BASE_URL } from '../config/api.js'
export const debug400Error = {
  // 记录错误详情
  logErrorDetails(error, project) {
    console.group('🔍 400错误详细分析')
    console.log('📋 错误对象:', error)
    console.log('📋 响应状态:', error.response?.status)
    console.log('📋 响应数据:', error.response?.data)
    console.log('📋 响应头:', error.response?.headers)
    console.log('📋 请求配置:', error.config)
    console.log('📋 项目信息:', project)
    console.groupEnd()
  },

  // 分析可能的原因
  analyzePossibleCauses(project) {
    console.group('🔍 可能的错误原因分析')
    
    const causes = []
    
    // 1. 检查项目状态
    if (!project.applicationStatus) {
      causes.push('❌ 缺少applicationStatus字段')
    } else if (project.applicationStatus !== '待审核') {
      causes.push(`⚠️ 申请状态为"${project.applicationStatus}"，不是"待审核"`)
    }
    
    // 2. 检查项目ID
    if (!project.id) {
      causes.push('❌ 缺少项目ID')
    }
    
    // 3. 检查时间相关字段
    const currentTime = new Date()
    const startTime = project.startTime || project.startDate
    const endTime = project.endTime || project.endDate
    
    if (startTime && new Date(startTime) <= currentTime) {
      causes.push('⚠️ 项目可能已开始')
    }
    
    if (endTime && new Date(endTime) <= currentTime) {
      causes.push('⚠️ 项目可能已结束')
    }
    
    // 4. 检查API端点
    const expectedEndpoint = `/projects/${project.id}/apply`
    const actualEndpoint = error.config?.url
    if (actualEndpoint !== expectedEndpoint) {
      causes.push(`❌ API端点不匹配: 期望 ${expectedEndpoint}, 实际 ${actualEndpoint}`)
    }
    
    // 5. 检查请求方法
    if (error.config?.method?.toLowerCase() !== 'delete') {
      causes.push(`❌ 请求方法错误: 期望 DELETE, 实际 ${error.config?.method}`)
    }
    
    console.log('可能的原因:', causes)
    
    if (causes.length === 0) {
      console.log('✅ 未发现明显的客户端错误，可能是服务器端问题')
    }
    
    console.groupEnd()
  },

  // 生成调试报告
  generateDebugReport(error, project) {
    const report = {
      timestamp: new Date().toISOString(),
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        data: error.config?.data
      },
      project: {
        id: project.id,
        name: project.name,
        applicationStatus: project.applicationStatus,
        participationStatus: project.participationStatus,
        status: project.status,
        enrolled: project.enrolled,
        capacity: project.capacity
      },
      userInfo: this.getUserInfo(),
      environment: this.getEnvironmentInfo()
    }
    
    console.log('📋 完整调试报告:', report)
    return report
  },

  // 获取用户信息
  getUserInfo() {
    try {
      const userInfo = localStorage.getItem('userInfo')
      return userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      return null
    }
  },

  // 获取环境信息
  getEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: {
        hasToken: !!localStorage.getItem('token'),
        hasUserInfo: !!localStorage.getItem('userInfo')
      }
    }
  },

  // 尝试自动修复
  attemptFixes(project) {
    console.group('🔧 尝试自动修复')
    
    const fixes = []
    
    // 1. 尝试刷新项目数据
    fixes.push({
      name: '刷新项目数据',
      action: () => {
        console.log('🔄 尝试刷新项目数据...')
        // 这里应该调用刷新函数，但由于作用域限制，只能提供建议
        console.log('建议: 调用 refreshProjectData() 函数')
      }
    })
    
    // 2. 检查Token有效性
    fixes.push({
      name: '检查Token',
      action: () => {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('❌ 未找到Token，可能需要重新登录')
        } else {
          console.log('✅ 找到Token:', token.substring(0, 20) + '...')
        }
      }
    })
    
    // 3. 验证API端点
    fixes.push({
      name: '验证API端点',
      action: () => {
        const expectedUrl = `${BASE_URL}/projects/${project.id}/apply`
        console.log('期望的API端点:', expectedUrl)
      }
    })
    
    console.log('可用的修复方案:', fixes)
    
    // 执行所有修复方案
    fixes.forEach(fix => {
      try {
        fix.action()
      } catch (error) {
        console.error(`修复"${fix.name}"失败:`, error)
      }
    })
    
    console.groupEnd()
  },

  // 建议的后端检查项
  getBackendChecklist() {
    return [
      '1. 检查 DELETE /api/projects/{id}/apply 路由是否正确定义',
      '2. 验证后端是否接收和处理 DELETE 请求',
      '3. 检查后端对 applicationStatus 字段的验证逻辑',
      '4. 确认后端返回的错误信息格式',
      '5. 检查数据库中项目状态是否正确',
      '6. 验证权限控制逻辑是否正确',
      '7. 检查是否有其他必需的请求参数或头部'
    ]
  }
}

// 在全局注册调试工具
if (typeof window !== 'undefined') {
  window.debug400Error = debug400Error
}