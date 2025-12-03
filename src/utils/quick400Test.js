// 快速400错误诊断工具
// 在浏览器控制台中运行： quick400Test()

window.quick400Test = function(projectId = 13) {
  console.log('🚀 开始快速400错误诊断...')
  console.log('🎯 目标项目ID:', projectId)
  
  // 1. 检查认证状态
  console.log('📋 1. 检查认证状态:')
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  console.log('   Token存在:', !!token)
  console.log('   Token前缀:', token ? token.substring(0, 20) + '...' : 'null')
  console.log('   用户信息存在:', !!userInfo)
  
  // 2. 获取项目信息
  console.log('\n📋 2. 获取项目信息:')
  fetch(`/api/projects/${projectId}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('   状态码:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('   项目数据:', data)
    
    // 3. 分析项目状态
    console.log('\n📋 3. 分析项目状态:')
    const projectData = data.data || data
    console.log('   项目状态:', projectData.status)
    console.log('   开始时间:', projectData.startDate)
    console.log('   结束时间:', projectData.endDate)
    console.log('   报名人数:', `${projectData.enrolled}/${projectData.capacity}`)
    
    // 4. 检查是否应该能删除
    const deletableStatuses = ['可报名', '申请中', '已报名']
    const canDelete = deletableStatuses.includes(projectData.status)
    console.log('   应该可以删除:', canDelete)
    
    // 5. 尝试删除操作
    console.log('\n📋 4. 尝试删除操作:')
    console.log('   发送DELETE请求...')
    
    return fetch(`/api/projects/${projectId}/apply`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    })
  })
  .then(response => {
    console.log('   删除响应状态:', response.status)
    console.log('   删除响应头:', Object.fromEntries(response.headers.entries()))
    return response.json()
  })
  .then(data => {
    console.log('   删除响应数据:', data)
    
    // 6. 分析删除结果
    console.log('\n📋 5. 分析删除结果:')
    if (data.code === 200 || data.code === 0) {
      console.log('   ✅ 删除成功!')
    } else {
      console.log('   ❌ 删除失败!')
      console.log('   错误码:', data.code)
      console.log('   错误消息:', data.message)
      console.log('   错误详情:', data.errors)
      
      // 7. 提供具体建议
      console.log('\n💡 建议解决方案:')
      if (data.message?.includes('已开始') || data.message?.includes('进行中')) {
        console.log('   - 项目已开始，请联系管理员处理')
      } else if (data.message?.includes('已结束') || data.message?.includes('已完成')) {
        console.log('   - 项目已结束，无法删除报名记录')
      } else if (data.errors) {
        console.log('   - 检查errors字段的详细错误信息')
        console.log('   - 可能需要联系后端开发人员查看具体限制')
      } else {
        console.log('   - 刷新页面后重试')
        console.log('   - 检查网络连接')
        console.log('   - 联系技术支持')
      }
    }
  })
  .catch(error => {
    console.error('❌ 诊断过程出错:', error)
    console.log('\n💡 可能的网络问题:')
    console.log('   - 检查网络连接')
    console.log('   - 确认后端服务是否正常运行')
    console.log('   - 检查CORS设置')
  })
  
  console.log('\n📊 诊断开始，请查看控制台输出...')
  console.log('📝 如需更多详细信息，运行: window.debug400Error.analyzePossibleCauses(project)')
}

console.log('🔧 快速400错误诊断工具已加载')
console.log('📝 使用方法: quick400Test(项目ID) - 默认项目ID为13')