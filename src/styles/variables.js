// 主题颜色变量（用于 JavaScript/TypeScript）
export const themeColors = {
  // 主色调
  primaryColor: '#409eff',
  primaryStart: '#357fff',
  primaryEnd: '#204dc7',

  // 渐变色组合（字符串形式，用于内联样式）
  gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientPink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  gradientBlue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  gradientGreen: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  gradientYellow: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  gradientPurple: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  gradientLight: 'linear-gradient(135deg,rgb(101, 206, 255) 0%, #fed6e3 100%)',
  gradientRose: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',

  // 文本颜色
  textPrimary: '#303133',
  textRegular: '#606266',
  textSecondary: '#909399',
  textPlaceholder: '#c0c4cc',

  // 背景颜色
  bgColor: '#f5f7fa',
  bgWhite: '#ffffff',
  bgHover: '#f0f4ff',

  // 功能颜色
  successColor: '#67c23a',
  warningColor: '#e6a23c',
  dangerColor: '#f56c6c',
  infoColor: '#909399',

  // 项目难度颜色映射
  difficultyBeginner: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  difficultyIntermediate: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  difficultyAdvanced: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

  // ECharts 图表颜色配置
  chartColors: {
    // 主色系
    primary: '#76afff',
    primaryLight: '#a0d3ff',
    secondary: '#de97ff',
    secondaryLight: '#f9c4ff',
    
    // 图表系列颜色
 
    
    // 渐变色配置（用于柱状图、折线图等）
    gradientStart: 'rgb(142, 197, 255)',
    gradientEnd: 'rgb(142, 197, 255)',
    gradientAreaStart: 'rgba(118, 175, 255, 0.3)',
    gradientAreaEnd: 'rgba(118, 175, 255, 0.1)',
    
    // 坐标轴颜色
    axisLine: '#e0e0e0',
    splitLine: '#f5f5f5',
    
    // 阴影颜色
    shadowColor: 'rgba(118, 175, 255, 0.5)'
  }
}

// 课程卡片颜色数组
export const courseCardColors = [
  themeColors.gradientPrimary,
  themeColors.gradientBlue,
  themeColors.gradientPink,
  themeColors.gradientGreen,
  themeColors.gradientYellow,
  themeColors.gradientPurple,
  themeColors.gradientLight,
  themeColors.gradientRose
]
