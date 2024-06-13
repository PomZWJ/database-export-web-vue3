<template>
  <el-dialog
      v-model="visible"
      width="90%"
      :show-close="false"
      align-center>
    <div class="my-content">
      <div class="header-content">
        <img alt="" src="@/assets/images/dm-icon-click.png">
      </div>
      <el-form :model="data" :rules="Rules" ref="ruleFormRef" class="el-form-default" :validate-on-rule-change="false">
        <el-form-item prop="ip">
          <el-input placeholder="127.0.0.1" v-model="data.ip" size="large">
            <template #prepend>IP地址</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="port">
          <el-input placeholder="3306" v-model="data.port" size="large">
            <template #prepend>端&nbsp;&nbsp;&nbsp;口</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="dbName">
          <el-input v-model="data.dbName" size="large">
            <template #prepend>数据库</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="userName">
          <el-input placeholder="root" v-model="data.userName" size="large">
            <template #prepend>用户名</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input placeholder="" v-model="data.password" size="large">
            <template #prepend>密&nbsp;&nbsp;&nbsp;码</template>
          </el-input>
        </el-form-item>
      </el-form>
      <el-tabs type="border-card">
        <el-tab-pane label="基础设置">
          <div style="display: flex;flex-direction: column">
            <div style="display: flex;align-items: center">
              <el-icon style="font-size: 20px;margin-right: 5px"><Upload /></el-icon>
              <span style="font-weight: bolder;font-size: 20px">导出类型</span>
            </div>
            <div style="display: flex;align-items: center;margin-top: 10px">
              <el-radio-group v-model="exportTypeSetList" size="large">
                <el-radio-button v-for="(item,index) in exportTypeOption" :key="index" :value="item.value" :label="item.text"/>
              </el-radio-group>
              <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="VIEW为跳转至预览界面"
                  placement="top">
                <el-icon style="font-size: 20px;margin-left: 5px;color: #409eff"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <div style="margin-top: 20px">
            <div style="display: flex;align-items: center">
              <el-icon style="font-size: 20px;margin-right: 5px"><Tools /></el-icon>
              <span style="font-weight: bolder;font-size: 20px">列名设置</span>
            </div>
            <div style="display: flex;align-items: center;margin-top: 10px">
              <el-checkbox-group v-model="columnSetList" size="large">
                <el-checkbox-button
                    v-for="(item,index) in columOption"
                    :key="index"
                    :value="item.value"
                    :disabled="['columnName','dataType'].includes(item.value)">
                  {{ item.text }}
                </el-checkbox-button>
              </el-checkbox-group>
              <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="列名和数据类型为必选"
                  placement="top">
                <el-icon style="font-size: 20px;margin-left: 5px;color: #409eff"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <div style="margin-top: 20px">
            <div style="display: flex;align-items: center">
              <el-icon style="font-size: 20px;margin-right: 5px"><Tools /></el-icon>
              <span style="font-weight: bolder;font-size: 20px">是否显示索引</span>
              <el-switch style="margin-left: 20px" v-model="showIndex" :active-value="1" :inactive-value="0"/>
            </div>
            <div v-if="showIndex" style="display: flex;align-items: center;margin-top: 10px">
              <el-checkbox-group v-model="indexSetList" size="large">
                <el-checkbox-button
                    v-for="(item,index) in indexOption"
                    :key="index"
                    :value="item.value"
                    :disabled="['fields'].includes(item.value)">
                  {{ item.text }}
                </el-checkbox-button>
              </el-checkbox-group>
              <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="索引字段为必选"
                  placement="top">
                <el-icon style="font-size: 20px;margin-left: 5px;color: #409eff"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="选择表">
          <el-tag v-for="tag in selectedTableList" :key="tag"
                  size="large"
                  type="primary"
                  style="margin-right: 10px;margin-bottom: 10px;"
                  closable
                  @close="deleteSelectedTable(tag)">
            {{tag}}
          </el-tag>
          <select-table @confirmEvent="getSelectedTableList" :dbParams="data" :selectedTableList="selectedTableList"></select-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <div class="dialog-footer" style="margin: 0 30px;">
        <el-button type="primary" size="large" :icon="Download" @click="submitForm(ruleFormRef)" :loading="makeLoading">生成</el-button>
        <el-button type="danger" size="large" style="margin-left: 20px;" :icon="Close" @click="closeDialog">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-col :span="6">
    <el-card shadow="hover" style="padding: 0;margin: 10px 10px;cursor: pointer" @click="openDialog">
      <div style="width: 100%;height: 200px;display: flex;justify-content: center;align-items: center;">
        <img alt="" src="@/assets/images/dm-icon-click.png" style="width: 120px;height: 120px;">
      </div>
      <div style="padding: 14px;text-align: center;margin: 20px 0">
        <span style="font-weight: bolder;font-size: 40px">{{dbKind}}</span>
      </div>
    </el-card>
  </el-col>
</template>
<script setup lang="ts">
import {reactive,ref,watch,getCurrentInstance} from 'vue'
const { proxy } = getCurrentInstance() as any;
import { Download,Close,Tools,Upload,QuestionFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import SelectTable from "@/views/select-table.vue";
const dbKind = ref<string>('DM')
const ruleFormRef = ref<FormInstance>()
const visible = ref<boolean>(false);
const showIndex = ref<number>(0);
const columnSetList = ref(['columnName','dataType'])
const indexSetList = ref(['fields'])
const exportTypeSetList = ref<string>('VIEW')
const exportTypeOption = ref<Array<DbBaseConfig>>([]);
const columOption = ref<Array<DbBaseConfig>>([]);
const indexOption = ref<Array<DbBaseConfig>>([]);
const selectedTableList = ref<Array<string>>([]);
const router = useRouter();
const makeLoading = ref<boolean>(false)
interface DbBaseConfig{
  value: string,
  text: string
}
interface RuleForm{
  dbKind: string,
  ip: string,
  port: number,
  dbName: string,
  userName: string,
  password: string,
  schemas: string
}
const data = reactive<RuleForm>({
  dbKind: 'dm',
  ip: '127.0.0.1',
  port: 5237,
  dbName: '',
  userName: '',
  password: '',
  schemas: ''
})
const Rules = reactive<FormRules<RuleForm>>({
  ip: [
    {required: true, message: '不能为空'}
  ],
  port: [
    {required: true, message: '不能为空'}
  ],
  dbName: [
    {required: true, message: '不能为空'}
  ],
  userName: [
    {required: true, message: '不能为空'}
  ],
  password: [
    {required: true, message: '不能为空'}
  ]
});
const deleteSelectedTable = (tag: string) => {
  selectedTableList.value.splice(selectedTableList.value.indexOf(tag), 1)
}
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if(exportTypeSetList.value == 'VIEW'){
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
      }else{
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
const getSelectedTableList = (arr:Array<string>) => {
  selectedTableList.value = arr;
}
const alertFailedNotification = (msg:string) => {
  ElMessage.error(msg)
}
watch(visible, (newValue)=>{
  if(newValue){
    getAsyncDbConfig();
  }
})
const getAsyncDbConfig = async () => {
  try {
    const response = await proxy.$axios.get('/getConfig/'+dbKind.value);
    if(response.data.resultCode != '000000'){
      throw new Error(response.data.resultMsg);
    }
    const data = response.data;
    columOption.value = data.params.columnConfig;
    indexOption.value = data.params.indexConfig;
    exportTypeOption.value = data.params.exportTypeConfig;
  } catch (error:any) {
    alertFailedNotification(error.message);
  }
};
const getMakeFile = async () => {
  let temp = data;
  makeLoading.value = true;
  try {
    let a = {};
    Object.assign(a,temp);
    Object.assign(a,{
      'columnSetList': columnSetList.value.join(','),
      'indexSetList': indexSetList.value.join(','),
      'exportTypeSetList': exportTypeSetList.value,
      'showIndex': showIndex.value,
      'selectTableStr': selectedTableList.value.join(','),
      'exportFileType': exportTypeSetList.value
    })
    const makeFileResponse = await proxy.$axios.post('/makeFile/',a);
    if(makeFileResponse.data.resultCode != '000000'){
      throw new Error(makeFileResponse.data.resultMsg);
    }
    let downloadPostData = {
      fileName: makeFileResponse.data.params.fileName
    }
    //useSuccessNotification("下载成功");
    // 发送 POST 请求
    const response = await proxy.$axios.post('/getFile', downloadPostData, {
      responseType: 'blob', // 重要！告诉 axios 期望返回的是一个 Blob 对象
    });

    // 创建一个 Blob 对象来保存文件内容
    const blob = new Blob([response.data], { type: response.headers['content-type'] });

    // 创建一个指向该 Blob 对象的 URL
    const url = window.URL.createObjectURL(blob);

    // 创建一个 a 标签来模拟点击下载
    const link = document.createElement('a');
    link.href = url;
    // 设置文件名，这里你可以根据服务器返回的数据或你的需求来设置
    link.setAttribute('download', makeFileResponse.data.params.fileName);

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 然后从 DOM 中移除该 a 标签
    document.body.removeChild(link);

    // 释放 URL 对象
    window.URL.revokeObjectURL(url);
    makeLoading.value = false;
  } catch (error:any) {
    makeLoading.value = false;
    alertFailedNotification(error.message)
  }
}
</script>
<style scoped lang="less">
.my-content{
  margin: 10px 30px;
  .header-content{
    text-align: center;
    margin-bottom: 20px;
    img{
      width: 50px;
      height: 50px;
    }
  }
}
</style>
