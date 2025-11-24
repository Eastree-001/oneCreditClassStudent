<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="left">
        <span>© {{ year }} EduNexus 学分课堂</span>
        <span class="dot">·</span>
        <span>公司授权：EduNexus 教育科技有限公司</span>
        <span class="dot">·</span>
        <span>版本 v1.0.0</span>
      </div>
      <div class="right">
        <a href="#" target="_blank" rel="noopener">隐私政策</a>
        <span class="sep">|</span>
        <a href="#" target="_blank" rel="noopener">服务条款</a>
        <span class="sep">|</span>
        <a href="#" target="_blank" rel="noopener">合规声明</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style lang="scss" scoped>
.app-footer {
  width: 100%;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;

  .dot { color: #c0c4cc; }
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;

  a {
    color: #909399;
    text-decoration: none;
  }

  a:hover { color: #606266; }

  .sep { color: #c0c4cc; }
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    gap: 6px;
  }
}
</style>


