<template>
  <div class="preview-page" v-loading="loading" element-loading-text="数据获取中...">
    <!-- 顶部头部 -->
    <header class="preview-header">
      <div class="header-inner">
        <div class="header-brand">
          <img src="@/assets/logo.png" class="brand-logo">
          <div class="brand-text">
            <h1>database-export</h1>
            <p>数据库表结构导出工具 v{{ projectVersion }}</p>
          </div>
        </div>
        <div class="header-db">
          <img src="@/assets/database-icon.png" class="db-icon">
          <el-tooltip effect="dark" content="数据库" placement="bottom">
            <span class="db-name">{{ dbJsonParams.dbName }}</span>
          </el-tooltip>
        </div>
      </div>
    </header>

    <!-- 主体：左右分栏 -->
    <div class="preview-body">
      <!-- 左侧：表名导航 -->
      <aside class="preview-aside">
        <div class="aside-search">
          <el-input
              v-model="searchTableName"
              :clearable="true"
              placeholder="搜索表名"
              size="large"
              :prefix-icon="Search"
              class="search-input"
              @input="onSearchInput"/>
        </div>
        <nav class="aside-list">
          <el-anchor
              container=".preview-content"
              direction="vertical"
              type="default"
              :offset="50"
              @click="handleClick">
            <el-anchor-link
                v-for="(item,index) in selectOptions"
                :key="index"
                :href="'#'+item.value"
                :title="item.label"
                @click.prevent.stop="jumpToTable(item.value)">
              <template #default>
                <img src="@/assets/table-icon.png" class="table-icon-sm"/>
                <span class="table-link-text" :title="item.label">{{ item.label }}</span>
              </template>
            </el-anchor-link>
          </el-anchor>
        </nav>
      </aside>

      <!-- 右侧：表结构内容 -->
      <main class="preview-content" ref="contentRef">
        <!-- 定位过渡遮罩 -->
        <transition name="jump-fade">
          <div v-if="isJumping" class="jumping-mask">
            <div class="jumping-spinner"></div>
            <span class="jumping-text">正在定位...</span>
          </div>
        </transition>
        <div :id="item.tableName" v-for="(item,index) in visibleData" :key="index" class="table-block">
          <div class="table-block-head">
            <img src="@/assets/table-icon.png" class="table-icon-lg"/>
            <h2>{{ item.tableName }}<span class="table-comments">({{ item.tableComments }})</span></h2>
          </div>
          <el-table
              :data="item.tabsColumn"
              border
              class="data-table"
              :header-cell-style="{ background: '#f5f8ff', color: '#1a2236', fontWeight: 600 }">
            <el-table-column
                v-for="(item2,index2) in tableData.fieldList"
                :key="index2"
                :prop="item2.prop"
                :label="item2.label"/>
          </el-table>

          <template v-if="showIndex">
            <div class="index-block-head">
              <h3>索引信息</h3>
            </div>
            <el-table
                :data="item.tabsIndex"
                border
                class="data-table"
                :header-cell-style="{ background: '#fff7f0', color: '#1a2236', fontWeight: 600 }">
              <el-table-column
                  v-for="(item2,index2) in tableData.indexFieldList"
                  :key="index2"
                  :prop="item2.prop"
                  :label="item2.label"/>
            </el-table>
          </template>
        </div>

        <el-backtop target=".preview-content" :bottom="60" :right="40">
          <div class="backtop-btn">
            <el-icon><Top /></el-icon>
          </div>
        </el-backtop>

        <!-- 滚动加载哨兵 -->
        <div ref="sentinelRef" class="load-sentinel">
          <span v-if="visibleCount >= filteredTotal && filteredTotal > 0" class="load-end">
            已加载全部 {{ filteredTotal }} 张表
          </span>
          <span v-else class="load-more">加载更多...</span>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, getCurrentInstance, computed, nextTick} from 'vue'
import {Search, Top} from '@element-plus/icons-vue'
import PackageJson from '../../package.json'
const {proxy} = getCurrentInstance() as any;
import {useRouter} from 'vue-router'
const router = useRouter();
const projectVersion = ref<string>(PackageJson.version);
const loading = ref<Boolean>(false);
const searchTableName = ref<string>('');

const columnSetList = ref<string>('');
const indexSetList = ref<string>('');
const showIndex = ref<number>(0);
const selectTableStr = ref<string>('')

/* ============ 滚动分页加载（避免大量表一次性渲染卡死） ============ */
const PAGE_SIZE = 20;          // 每批渲染数量
const visibleCount = ref<number>(PAGE_SIZE);
const contentRef = ref<HTMLElement | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// 过滤后的完整列表
const filteredData = computed(() => {
  const data = tableData.value.tableDetailInfo || [];
  if (!searchTableName.value) return data;
  return data.filter(item => {
    const text = item.tableName + '(' + item.tableComments + ')';
    return text.indexOf(searchTableName.value) !== -1;
  });
});
const filteredTotal = computed(() => filteredData.value.length);
// 当前可见的列表
const visibleData = computed(() => filteredData.value.slice(0, visibleCount.value));

const loadMore = () => {
  if (visibleCount.value < filteredTotal.value) {
    visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, filteredTotal.value);
  }
};

const setupObserver = () => {
  if (!sentinelRef.value || !contentRef.value) return;
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  }, { root: contentRef.value, rootMargin: '200px' });
  observer.observe(sentinelRef.value);
};

// 搜索时重置分页
const onSearchChange = () => {
  visibleCount.value = PAGE_SIZE;
};

const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}

// 点击左侧导航：先确保目标表已渲染，再滚动定位
const isJumping = ref<boolean>(false);
const jumpToTable = async (tableName: string) => {
  const list = filteredData.value;
  const idx = list.findIndex(it => it.tableName === tableName);
  if (idx === -1) return;

  // 目标超出当前可见范围 -> 扩展到包含目标
  const needExpand = idx >= visibleCount.value;
  if (needExpand) {
    isJumping.value = true;
    visibleCount.value = Math.min(idx + PAGE_SIZE, list.length);
    // 等待 Vue 更新 + 浏览器完成布局（双 rAF）
    await nextTick();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  const el = document.getElementById(tableName);
  if (el && contentRef.value) {
    contentRef.value.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
  }
  // 滚动动画约 300ms 后隐藏定位提示
  if (needExpand) {
    setTimeout(() => { isJumping.value = false; }, 400);
  }
};
const tableData = ref<tableDataDefine>({
  tableDetailInfo: [],
  fieldList: [],
  indexFieldList: []
});
const dbJsonParams = ref<RuleForm>({
  dbKind: '',
  ip: '',
  port: 0,
  dbName: '',
  userName: '',
  password: '',
  schemas: ''
})
interface tableDataDefine {
  tableDetailInfo: Array<tableDetailDefine>,
  fieldList: Array<genItemDefine>,
  indexFieldList: Array<genItemDefine>,
}
interface genItemDefine {
  prop: string,
  label: string
}
interface tableDetailDefine {
  tableName: string,
  tableComments: string,
  tabsColumn: Array<any>,
  tabsIndex: Array<any>,
}
interface RuleForm {
  dbKind: string,
  ip: string,
  port: number,
  dbName: string,
  userName: string,
  password: string,
  schemas: string
}
onMounted(() => {
  dbJsonParams.value = JSON.parse(atob(<string>router.currentRoute.value.query.base64Params));
  columnSetList.value = <string>router.currentRoute.value.query.columnSetList;
  indexSetList.value = <string>router.currentRoute.value.query.indexSetList;
  showIndex.value = Number(router.currentRoute.value.query.showIndex);
  selectTableStr.value = <string>router.currentRoute.value.query.selectTableStr;
  getTableList();
})
onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

// 搜索框输入时重置分页
const onSearchInput = () => {
  visibleCount.value = PAGE_SIZE;
};

// 左侧导航选项（复用 filteredData，避免重复计算）
const selectOptions = computed(() => {
  return filteredData.value.map(item => ({
    value: item.tableName,
    label: item.tableName + '(' + item.tableComments + ')'
  }));
})
const getTableList = async () => {
  try {
    loading.value = true;
    let postData = {}
    Object.assign(postData, dbJsonParams.value)
    Object.assign(postData, {
      columnSetList: columnSetList.value,
      indexSetList: indexSetList.value,
      showIndex: showIndex.value,
      selectTableStr: selectTableStr.value
    })
    const response = await proxy.$axios.post('/getTableData', postData);
    tableData.value = response.data.params;
    loading.value = false;
    // 数据加载完成后启动懒加载观察
    visibleCount.value = PAGE_SIZE;
    await nextTick();
    setupObserver();
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};
</script>

<style scoped lang="less">
@primary: #4f7cff;
@text-main: #1a2236;
@text-sub: #6b7280;
@border: #eef0f5;

.preview-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fb;
}

/* ============ 顶部头部 ============ */
.preview-header {
  background: #fff;
  border-bottom: 1px solid @border;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04);

  .header-inner {
    max-width: 100%;
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 14px;

    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(79, 124, 255, 0.18);
    }

    .brand-text {
      h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: @text-main;
        line-height: 1.2;
        letter-spacing: 0.3px;
      }

      p {
        margin: 4px 0 0;
        font-size: 13px;
        color: @text-sub;
      }
    }
  }

  .header-db {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #f5f8ff;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #eaf0ff;
    }

    .db-icon {
      width: 20px;
      height: 20px;
    }

    .db-name {
      font-size: 15px;
      font-weight: 600;
      color: @primary;
    }
  }
}

/* ============ 主体：左右分栏 ============ */
.preview-body {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 0;
}

/* 左侧导航 */
.preview-aside {
  background: #fff;
  border-right: 1px solid @border;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .aside-search {
    padding: 16px 16px 12px;
    border-bottom: 1px solid @border;

    .search-input :deep(.el-input__wrapper) {
      border-radius: 8px;
    }
  }

  .aside-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 8px 16px;

    /* 滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    :deep(.el-anchor) {
      width: 100%;
    }

    :deep(.el-anchor__link) {
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        background: #f5f8ff;
      }

      &.is-active {
        background: rgba(79, 124, 255, 0.1);
        color: @primary;
      }
    }

    .table-icon-sm {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    .table-link-text {
      font-size: 13px;
      font-weight: 500;
      color: @text-main;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* 右侧内容 */
.preview-content {
  overflow-y: auto;
  padding: 24px 32px 60px;
  position: relative;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c8c8c8;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .table-block {
    background: #fff;
    border: 1px solid @border;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);

    .table-block-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 2px solid #f5f8ff;

      .table-icon-lg {
        width: 22px;
        height: 22px;
      }

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: @text-main;
        letter-spacing: 0.2px;
      }

      .table-comments {
        font-size: 15px;
        font-weight: 500;
        color: @text-sub;
        margin-left: 4px;
      }
    }

    .index-block-head {
      margin: 20px 0 12px;

      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #ed7c2f;
        display: inline-flex;
        align-items: center;

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 14px;
          background: linear-gradient(180deg, #ed7c2f, #f5a623);
          border-radius: 2px;
          margin-right: 8px;
        }
      }
    }

    .data-table {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;

      :deep(.el-table__header th) {
        height: 44px;
        font-size: 13px;
      }

      :deep(.el-table__body td) {
        padding: 10px 0;
        font-size: 13px;
      }
    }
  }

  .backtop-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, @primary 0%, #6a9bff 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(79, 124, 255, 0.3);
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(79, 124, 255, 0.4);
    }
  }

  /* 底部加载哨兵 */
  .load-sentinel {
    padding: 24px 0 8px;
    text-align: center;

    .load-more {
      font-size: 13px;
      color: @text-sub;
    }

    .load-end {
      font-size: 13px;
      color: #9ca3af;
    }
  }

  /* 定位过渡遮罩 */
  .jumping-mask {
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;

    .jumping-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e0e7ff;
      border-top-color: @primary;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .jumping-text {
      margin-top: 12px;
      font-size: 13px;
      color: @primary;
      font-weight: 600;
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 过渡动画 */
.jump-fade-enter-active,
.jump-fade-leave-active {
  transition: opacity 0.25s ease;
}
.jump-fade-enter-from,
.jump-fade-leave-to {
  opacity: 0;
}
</style>
