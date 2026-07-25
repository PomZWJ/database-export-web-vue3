<template>
  <el-dialog
      v-model="visible"
      width="1200px"
      :show-close="false"
      align-center
      class="db-dialog">
    <!-- 顶部头部区：渐变背景 + 图标 + 标题 -->
    <div class="dialog-header">
      <div class="dialog-header-bg"></div>
      <img alt="" :src="config.icon" class="dialog-header-icon">
      <div class="dialog-header-text">
        <h2>{{ config.kind }}</h2>
        <p>配置连接参数并导出表结构文档</p>
      </div>
    </div>

    <!-- 主体：左右分栏 -->
    <div class="dialog-body">
      <!-- 左侧：连接配置 -->
      <aside class="panel-aside">
        <div class="panel-title">
          <span class="panel-index">1</span>
          <span>连接配置</span>
        </div>
        <el-form
            :model="data"
            :rules="rules"
            ref="ruleFormRef"
            class="el-form-default panel-form"
            :validate-on-rule-change="false"
            label-position="top">
          <template v-if="config.showConnection">
            <el-form-item prop="ip" label="IP地址">
              <el-input placeholder="127.0.0.1" v-model="data.ip" size="large"/>
            </el-form-item>
            <el-form-item prop="port" label="端口">
              <el-input placeholder="3306" v-model="data.port" size="large"/>
            </el-form-item>
          </template>
          <el-form-item prop="dbName" :label="config.dbNameLabel">
            <el-input :placeholder="config.dbNamePlaceholder" v-model="data.dbName" size="large"/>
          </el-form-item>
          <el-form-item v-if="config.showSchemas" prop="schemas" label="模式">
            <el-input v-model="data.schemas" size="large"/>
          </el-form-item>
          <template v-if="config.showConnection">
            <el-form-item prop="userName" label="用户名">
              <el-input v-model="data.userName" size="large"/>
            </el-form-item>
            <el-form-item prop="password" label="密码">
              <el-input placeholder="" v-model="data.password" size="large" type="password" show-password/>
            </el-form-item>
          </template>
        </el-form>
      </aside>

      <!-- 右侧：导出设置 -->
      <section class="panel-main">
        <div class="panel-title">
          <span class="panel-index">2</span>
          <span>导出设置</span>
        </div>
        <el-tabs v-model="activeTab" class="setting-tabs">
          <el-tab-pane label="基础设置" name="basic">
            <div class="setting-group">
              <div class="setting-group-head">
                <el-icon><Upload /></el-icon>
                <span class="setting-group-title">导出类型</span>
                <el-tooltip effect="dark" content="VIEW为跳转至预览界面" placement="top">
                  <el-icon class="setting-tip"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="setting-group-body">
                <el-radio-group v-model="exportTypeSetList" size="large">
                  <el-radio-button v-for="(item,index) in exportTypeOption" :key="index" :value="item.value" :label="item.text"/>
                </el-radio-group>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-group-head">
                <el-icon><Tools /></el-icon>
                <span class="setting-group-title">列名设置</span>
                <el-tooltip effect="dark" content="列名和数据类型为必选" placement="top">
                  <el-icon class="setting-tip"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="setting-group-body">
                <el-checkbox-group v-model="columnSetList" size="large">
                  <el-checkbox-button
                      v-for="(item,index) in columOption"
                      :key="index"
                      :value="item.value"
                      :disabled="['columnName','dataType'].includes(item.value)">
                    {{ item.text }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-group-head">
                <el-icon><Tools /></el-icon>
                <span class="setting-group-title">是否显示索引</span>
                <el-switch v-model="showIndex" :active-value="1" :inactive-value="0"/>
              </div>
              <div v-if="showIndex" class="setting-group-body">
                <el-checkbox-group v-model="indexSetList" size="large">
                  <el-checkbox-button
                      v-for="(item,index) in indexOption"
                      :key="index"
                      :value="item.value"
                      :disabled="['fields'].includes(item.value)">
                    {{ item.text }}
                  </el-checkbox-button>
                </el-checkbox-group>
                <el-tooltip effect="dark" content="索引字段为必选" placement="top">
                  <el-icon class="setting-tip"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="选择表" name="tables">
            <div class="table-select-area">
              <el-tag v-for="tag in selectedTableList" :key="tag"
                      size="large"
                      type="primary"
                      closable
                      @close="deleteSelectedTable(tag)">
                {{tag}}
              </el-tag>
              <el-button type="primary" plain :icon="Plus" @click="showSelectTable(ruleFormRef)">新增</el-button>
            </div>
            <select-table @confirmEvent="getSelectedTableList" :dbParams="data" :selectedTableList="selectedTableList" ref="selectTableRef"></select-table>
          </el-tab-pane>
        </el-tabs>
      </section>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" :icon="Close" @click="closeDialog">关闭</el-button>
        <el-button type="primary" size="large" :icon="Download" @click="submitForm(ruleFormRef)" :loading="makeLoading">生成</el-button>
      </div>
    </template>
  </el-dialog>
  <div class="db-card" @click="openDialog">
    <div class="db-card-icon">
      <img alt="" :src="config.icon">
    </div>
    <div class="db-card-name">{{ config.kind }}</div>
  </div>
</template>
<script setup lang="ts">
import {reactive, ref, watch, computed, getCurrentInstance} from 'vue'
import {Download, Close, Tools, Upload, QuestionFilled, Plus} from '@element-plus/icons-vue'
import type {FormInstance, FormRules} from 'element-plus'
import {ElMessage} from 'element-plus'
import {useRouter} from 'vue-router'
import SelectTable from '@/views/select-table.vue'
import type {DbConfig} from '@/config/db-config'

const props = defineProps<{ config: DbConfig }>()

const {proxy} = getCurrentInstance() as any
const router = useRouter()

const ruleFormRef = ref<FormInstance>()
const visible = ref<boolean>(false)
const activeTab = ref<string>('basic')
const showIndex = ref<number>(0)
const columnSetList = ref(['columnName', 'dataType'])
const indexSetList = ref(['fields'])
const exportTypeSetList = ref<string>('VIEW')
const exportTypeOption = ref<Array<DbBaseConfig>>([])
const columOption = ref<Array<DbBaseConfig>>([])
const indexOption = ref<Array<DbBaseConfig>>([])
const selectedTableList = ref<Array<string>>([])
const selectTableRef = ref<InstanceType<typeof SelectTable> | null>(null)
const makeLoading = ref<boolean>(false)

interface DbBaseConfig {
  value: string
  text: string
}

interface RuleForm {
  dbKind: string
  ip: string
  port: number
  dbName: string
  userName: string
  password: string
  schemas: string
}

const data = reactive<RuleForm>({
  dbKind: props.config.dbKind,
  ip: '127.0.0.1',
  port: props.config.port,
  dbName: props.config.dbName,
  userName: props.config.userName,
  password: props.config.password,
  schemas: props.config.schemas,
})

const rules = computed<FormRules<RuleForm>>(() => {
  const r: FormRules<RuleForm> = {}
  if (props.config.showConnection) {
    r.ip = [{required: true, message: '不能为空'}]
    r.port = [{required: true, message: '不能为空'}]
    r.userName = [{required: true, message: '不能为空'}]
    r.password = [{required: true, message: '不能为空'}]
  }
  r.dbName = [{required: true, message: '不能为空'}]
  if (props.config.showSchemas && props.config.schemasRequired) {
    r.schemas = [{required: true, message: '不能为空'}]
  }
  return r
})

const deleteSelectedTable = (tag: string) => {
  selectedTableList.value.splice(selectedTableList.value.indexOf(tag), 1)
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (exportTypeSetList.value == 'VIEW') {
        const {href} = router.resolve({
          name: 'Preview',
          query: {
            'base64Params': btoa(JSON.stringify(data)),
            'columnSetList': columnSetList.value.join(','),
            'indexSetList': indexSetList.value.join(','),
            'exportTypeSetList': exportTypeSetList.value,
            'showIndex': showIndex.value,
            'selectTableStr': selectedTableList.value.join(',')
          }
        });
        window.open(href, '_blank')
      } else {
        getMakeFile();
      }
    }
  })
}

const closeDialog = () => {
  visible.value = false
}

const openDialog = () => {
  visible.value = true
}

const getSelectedTableList = (arr: Array<string>) => {
  selectedTableList.value = arr;
}

const alertFailedNotification = (msg: string) => {
  ElMessage.error(msg)
}

watch(visible, (newValue) => {
  if (newValue) {
    getAsyncDbConfig();
  }
})

const getAsyncDbConfig = async () => {
  try {
    const response = await proxy.$axios.get('/getConfig/' + props.config.kind);
    if (response.data.resultCode != '000000') {
      throw new Error(response.data.resultMsg);
    }
    const resData = response.data;
    columOption.value = resData.params.columnConfig;
    indexOption.value = resData.params.indexConfig;
    exportTypeOption.value = resData.params.exportTypeConfig;
  } catch (error: any) {
    alertFailedNotification(error.message);
  }
};

const getMakeFile = async () => {
  makeLoading.value = true;
  try {
    let a: any = {};
    Object.assign(a, data);
    Object.assign(a, {
      'columnSetList': columnSetList.value.join(','),
      'indexSetList': indexSetList.value.join(','),
      'exportTypeSetList': exportTypeSetList.value,
      'showIndex': showIndex.value,
      'selectTableStr': selectedTableList.value.join(','),
      'exportFileType': exportTypeSetList.value
    })
    const makeFileResponse = await proxy.$axios.post('/makeFile/', a);
    if (makeFileResponse.data.resultCode != '000000') {
      throw new Error(makeFileResponse.data.resultMsg);
    }
    const downloadPostData = {
      fileName: makeFileResponse.data.params.fileName
    }
    const response = await proxy.$axios.post('/getFile', downloadPostData, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {type: response.headers['content-type']});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', makeFileResponse.data.params.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    makeLoading.value = false;
  } catch (error: any) {
    makeLoading.value = false;
    alertFailedNotification(error.message)
  }
}

const showSelectTable = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      selectTableRef.value!.showClick()
    }
  })
}
</script>
<style scoped lang="less">
@primary: #4f7cff;
@text-main: #1a2236;
@text-sub: #6b7280;
@border: #eef0f5;

/* ============ 弹窗：纵向流程式 ============ */
/* el-dialog 内容 teleport 到 body，scoped :deep 不可靠，用全局样式 */
:global(.db-dialog) {
  border-radius: 16px;
  overflow: hidden;
  margin-top: 0;
}

:global(.db-dialog .el-dialog__header) {
  display: none !important;
  padding: 0;
  margin: 0;
}

:global(.db-dialog .el-dialog__body) {
  padding: 0 !important;
}

:global(.db-dialog .el-dialog__footer) {
  padding: 18px 32px !important;
  border-top: 1px solid #f0f2f5;
}

/* 顶部头部区：与 dialog 圆角融为一体 */
.dialog-header {
  position: relative;
  padding: 28px 32px;
  background: linear-gradient(135deg, #4f7cff 0%, #6a9bff 100%);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 18px;
  overflow: hidden;

  .dialog-header-bg {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .dialog-header-icon {
    width: 56px;
    height: 56px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 6px;
    position: relative;
    z-index: 1;
  }

  .dialog-header-text {
    position: relative;
    z-index: 1;

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: 0.3px;
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}

/* 主体：左右分栏 */
.dialog-body {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 0;
  min-height: 460px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
}

/* 左右面板通用标题 */
.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;

  .panel-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, @primary 0%, #6a9bff 100%);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(79, 124, 255, 0.3);
  }

  > span:last-child {
    font-size: 15px;
    font-weight: 700;
    color: @text-main;
    letter-spacing: 0.3px;
  }
}

/* 左侧面板 */
.panel-aside {
  padding: 24px 24px 24px 32px;
  border-right: 1px solid #f0f2f5;
  background: #fafbfd;

  @media (max-width: 760px) {
    border-right: none;
    border-bottom: 1px solid #f0f2f5;
  }
}

/* 右侧面板 */
.panel-main {
  padding: 24px 32px 24px 24px;
  min-width: 0;
}

/* 表单 */
.panel-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #4b5563;
    line-height: 1.4;

    &::before {
      display: none;
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #e5e7eb inset;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px @primary inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px @primary inset, 0 0 0 3px rgba(79, 124, 255, 0.12);
    }
  }
}

/* Tab 区 */
.setting-tabs {
  border: none;
  box-shadow: none;

  :deep(.el-tabs__header) {
    margin: 0 0 18px;
    border-bottom: 2px solid #f0f2f5;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 600;
    color: @text-sub;
    padding: 0 4px;
    margin-right: 24px;

    &.is-active {
      color: @primary;
    }

    &:hover {
      color: @primary;
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, @primary, #6a9bff);
  }
}

/* 设置组：卡片化 */
.setting-group {
  background: #fafbfd;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 12px;
  transition: all 0.22s ease;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #fff;
    border-color: rgba(79, 124, 255, 0.3);
    box-shadow: 0 4px 14px rgba(79, 124, 255, 0.08);
  }

  .setting-group-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .el-icon {
      font-size: 16px;
      color: @primary;
    }

    .setting-group-title {
      font-size: 14px;
      font-weight: 700;
      color: @text-main;
    }

    .el-switch {
      margin-left: auto;
    }
  }

  .setting-group-body {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    /* 导出类型 / 列名 / 索引：保持单行，放不下时横向滚动 */
    :deep(.el-radio-group),
    :deep(.el-checkbox-group) {
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      max-width: 100%;

      /* 滚动条美化 */
      &::-webkit-scrollbar {
        height: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: #cdd5e3;
        border-radius: 2px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
    }

    /* 紧凑按钮内边距，避免轻易换行 */
    :deep(.el-radio-button__inner),
    :deep(.el-checkbox-button__inner) {
      padding: 8px 14px;
      white-space: nowrap;
    }
  }

  .setting-tip {
    font-size: 15px;
    color: #c0c4cc;
    cursor: help;
    transition: color 0.2s;

    &:hover {
      color: @primary;
    }
  }
}

/* 选择表区域 */
.table-select-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 48px;
  padding: 14px 16px;
  background: #fafbfd;
  border-radius: 10px;
  border: 1px dashed #d1d5db;
}

/* ============ 弹窗底部 ============ */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  :deep(.el-button) {
    border-radius: 10px;
    padding: 0 24px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  :deep(.el-button--default) {
    border-color: #e5e7eb;
    color: @text-sub;

    &:hover {
      color: @text-main;
      border-color: #d1d5db;
      background: #f9fafb;
    }
  }

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, @primary 0%, #6a9bff 100%);
    border: none;
    color: #fff;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(79, 124, 255, 0.32);
    }
  }
}

/* ============ 数据库卡片（列表页） ============ */
.db-card {
  position: relative;
  background: #fff;
  border: 1px solid @border;
  border-radius: 16px;
  padding: 28px 20px 22px;
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  /* 顶部装饰渐变条，hover 时显现 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, @primary, #7fb2ff);
    opacity: 0;
    transition: opacity 0.28s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(79, 124, 255, 0.3);
    box-shadow: 0 12px 32px rgba(79, 124, 255, 0.12);

    &::before {
      opacity: 1;
    }

    .db-card-icon img {
      transform: scale(1.08);
    }
  }

  .db-card-icon {
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;

    img {
      width: 88px;
      height: 88px;
      object-fit: contain;
      transition: transform 0.28s ease;
    }
  }

  .db-card-name {
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: @text-main;
    letter-spacing: 0.3px;
    margin-bottom: 14px;
  }
}
</style>
