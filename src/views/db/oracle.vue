<template>
  <el-col :span="6">
    <el-popover
        placement="right"
        width="700"
        trigger="click"
        :visible="visible">
      <div style="margin: 30px 40px;">
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
        <el-row style="justify-content: center;align-items: center;display: flex">
          <el-button type="primary" plain :icon="Download" @click="submitForm(ruleFormRef)">生成</el-button>
          <el-button type="danger" style="margin-left: 20px;" plain :icon="Close" @click="closeDialog">关闭</el-button>
        </el-row>
      </div>
      <template #reference>
        <el-card shadow="hover" style="padding: 0;margin: 10px 10px;cursor: pointer" @click="openDialog">
          <div style="width: 100%;height: 200px;display: flex;justify-content: center;align-items: center;">
            <img alt="" src="@/assets/images/oracle-icon-click.png" style="width: 120px;height: 120px;">
          </div>
          <div style="padding: 14px;text-align: center;margin: 20px 0">
            <span style="font-weight: bolder;font-size: 40px">Oracle</span>
          </div>
        </el-card>
      </template>
    </el-popover>
  </el-col>
</template>
<script setup lang="ts">
import {reactive,ref} from 'vue'
import { Download,Close } from '@element-plus/icons-vue'
import type {FormInstance, FormRules } from 'element-plus'
const ruleFormRef = ref<FormInstance>()
const visible = ref<Boolean>(false);
interface RuleForm{
  ip: string,
  port: number,
  dbName: string,
  userName: string,
  password: string
}
const data = reactive<RuleForm>({
  ip: '127.0.0.1',
  port: 3306,
  dbName: 'demo_db',
  userName: 'root',
  password: '123456',
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
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}
const closeDialog = () => {
  visible.value = false
}
const openDialog = () => {
  visible.value = true
}
</script>
<style scoped lang="less">

</style>