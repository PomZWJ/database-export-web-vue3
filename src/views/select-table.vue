<template>
  <el-drawer v-model="drawer" direction="rtl" size="50%">
    <template #header>
      <h4>{{dbParams.dbName}}</h4>
    </template>
    <template #default>
      <el-table ref="multipleTableRef" :data="tableData" style="width: 100%;" border>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="tableName" label="表名" />
        <el-table-column prop="tableComments" label="表备注" width="280" />
      </el-table>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="confirmClick">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { ref,getCurrentInstance,watch } from 'vue'
import {ElMessage, ElTable} from 'element-plus'
const { proxy } = getCurrentInstance() as any;
const drawer = ref(false)
const tableData = ref([]);
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
interface RuleForm{
  dbKind: string,
  ip: string,
  port: number,
  dbName: string,
  userName: string,
  password: string,
  schemas: string
}
interface Props {
  dbParams: RuleForm;
  selectedTableList: Array<string>
}
const props = defineProps<Props>();

const $emit = defineEmits(['confirmEvent'])
watch(drawer, (newValue)=>{
  if(newValue){
    getAllTable();
  }
})
const toggleSelection = (rows?: string[]) => {
  if (rows) {
    rows.forEach((row) => {
      multipleTableRef.value!.toggleRowSelection(row, true)
    })
  } else {
    multipleTableRef.value!.clearSelection()
  }
}
const alertFailedNotification = (msg:string) => {
  ElMessage.error(msg)
}
const getAllTable = async () => {
  try {
    const response = await proxy.$axios.post('/getAllTableInfo/',props.dbParams);
    if(response.data.resultCode != '000000'){
      throw new Error(response.data.resultMsg);
    }
    tableData.value = response.data.params;
    toggleSelection(props.selectedTableList);
  } catch (error:any) {
    alertFailedNotification(error.message)
  }
};
const cancelClick=()=> {
  drawer.value = false
}
const showClick=()=> {
  drawer.value = true
}
function confirmClick() {
  //通过Element-Plus表格的getSelectionRows的方法，获取已选中的数据
  let tableData = multipleTableRef.value!.getSelectionRows();
  let arrTemp = [];
  for(let i=0;i<tableData.length;i++){
    arrTemp.push(tableData[i].tableName);
  }
  cancelClick();
  $emit('confirmEvent',arrTemp);
}
defineExpose({
  showClick,
  cancelClick
});
</script>
<style scoped lang="less">

</style>