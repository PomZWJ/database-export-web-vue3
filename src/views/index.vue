<template>
  <div class="page">
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <img class="brand-logo" alt="" src="@/assets/logo.png">
          <div class="brand-text">
            <h1 class="brand-name">{{ projectName }}</h1>
            <p class="brand-desc">{{ projectDescription }} <span class="brand-version">v{{ projectVersion }}</span></p>
          </div>
        </div>
        <nav class="header-actions">
          <el-tooltip effect="dark" content="Gitee" placement="bottom">
            <a class="action-link" href="https://gitee.com/pomz/database-export" target="_blank" rel="noopener">
              <img alt="gitee" src="@/assets/images/gitee-icon.png">
            </a>
          </el-tooltip>
          <el-tooltip effect="dark" content="GitHub" placement="bottom">
            <a class="action-link" href="https://github.com/PomZWJ/database-export/" target="_blank" rel="noopener">
              <img alt="github" src="@/assets/images/gitHub-icon.png">
            </a>
          </el-tooltip>
          <el-tooltip effect="dark" content="关于作者" placement="bottom">
            <a class="action-link" href="https://pomzwj.github.io/" target="_blank" rel="noopener">
              <img alt="about" src="@/assets/images/aboutme.png">
            </a>
          </el-tooltip>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <div class="main-inner">
        <div class="section-title">
          <h2>选择数据库类型</h2>
          <p>支持 {{ dbConfigs.length }} 种主流数据库，点击卡片开始导出表结构</p>
        </div>
        <div class="db-grid">
          <DbCard v-for="cfg in dbConfigs" :key="cfg.dbKind" :config="cfg"/>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <span>© {{ new Date().getFullYear() }} {{ projectName }} · Powered by Vue 3 + Element Plus</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import PackageJson from '../../package.json'
import DbCard from '@/components/DbCard.vue'
import {dbConfigs} from '@/config/db-config'
const projectName = ref<String>(PackageJson.name);
const projectVersion = ref<String>(PackageJson.version)
const projectDescription = ref<String>(PackageJson.description)
</script>

<style scoped lang="less">
@primary: #4f7cff;
@text-main: #1a2236;
@text-sub: #6b7280;
@border: #eef0f5;

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid @border;

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 16px;

    .brand-logo {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(79, 124, 255, 0.18);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: @text-main;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }

    .brand-desc {
      margin: 4px 0 0;
      font-size: 13px;
      color: @text-sub;
    }

    .brand-version {
      display: inline-block;
      margin-left: 6px;
      padding: 1px 8px;
      font-size: 12px;
      color: @primary;
      background: rgba(79, 124, 255, 0.1);
      border-radius: 999px;
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .action-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(79, 124, 255, 0.08);
        transform: translateY(-1px);
      }

      img {
        width: 22px;
        height: 22px;
      }
    }
  }
}

/* 主体区域 */
.app-main {
  flex: 1;
  padding: 48px 32px 64px;

  .main-inner {
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    margin-bottom: 32px;
    text-align: center;

    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: @text-main;
      letter-spacing: 0.5px;
    }

    p {
      margin: 8px 0 0;
      font-size: 14px;
      color: @text-sub;
    }
  }
}

/* 响应式网格：大屏 4 列 / 中屏 3 列 / 小屏 2 列 / 手机 1 列 */
.db-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

/* 底部 */
.app-footer {
  padding: 24px 32px;
  text-align: center;
  font-size: 12px;
  color: @text-sub;
  border-top: 1px solid @border;
}
</style>
