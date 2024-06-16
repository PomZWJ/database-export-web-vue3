<template>
  <el-container v-loading="loading" element-loading-text="数据获取中...">
    <el-header style="height: 120px;border-bottom: solid rgba(0,0,0,0.22) 1px">
      <div style="width: 100%;display: flex">
        <div style="display: flex;flex-direction: row;width: 50%;margin-left: 20px;margin-top: 10px;">
          <div>
            <img src="@/assets/logo.png" style="width: 100px;height: 100px">
          </div>
          <div style="display: flex;flex-direction: column;align-items: flex-start;margin-left: 15px">
            <span style="font-size: 46px;font-weight: bolder">database-export</span>
            <span style="margin-top: 10px">数据库表结构导出工具V5.0.0</span>
          </div>
        </div>
        <div style="width: 50%;cursor:pointer;display: flex;flex-direction: row-reverse;justify-items: center;align-items: center">
          <el-tooltip class="item" effect="dark" content="数据库" placement="bottom-start">
            <h3>{{dbJsonParams.dbName}}</h3>
          </el-tooltip>
          <img src="@/assets/database-icon.png" style="width: 30px;height: 30px;margin-right: 10px;"/>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside style=" height: calc(100vh - 140px);padding-top: 10px;">
        <el-container style="height: 100%;">
          <el-header style="height: 50px;padding: 0;">
            <el-input v-model="searchTableName" :clearable="true" placeholder="搜索表名" size="large" style="width: 100%"></el-input>
          </el-header>
          <el-main style="padding: 0;height: calc(100vh - 140px);">
            <el-menu style="border: none">
              <el-anchor
                  container=".my-content"
                  direction="vertical"
                  type="default"
                  :offset="50"
                  @click="handleClick">
                <el-anchor-link  v-for="(item,index) in selectOptions" :key="index" :href="'#'+item.value" :title="item.label">
                  <template #default>
                    <img src="@/assets/table-icon.png" style="width: 15px;height: 15px;margin-right: 5px;"/>
                    <span style="font-weight: bolder;" :title="item.label">{{ item.label }}</span>
                  </template>
                </el-anchor-link>
              </el-anchor>
            </el-menu>
          </el-main>
        </el-container>
      </el-aside>
      <el-main id="scrollMain" class="my-content" style="height: calc(100vh - 140px);padding: 10px 30px 30px;">
        <div :id="item.tableName" v-for="(item,index) in tableData.tableDetailInfo" :key="index">
          <div style="display: flex;justify-content: left;align-items: center">
            <img src="@/assets/table-icon.png" style="width: 25px;height: 25px;margin-right: 10px;"/>
            <h1 style="font-size: 30px;">{{ item.tableName }}({{ item.tableComments }})</h1>
          </div>
          <el-table :data="item.tabsColumn" border style="width: 100%"
                    :header-cell-style="{
                      /*background:'#38a4ed',height:'50px',*/color:'#000000'
                    }">
            <el-table-column v-for="(item2,index2) in tableData.fieldList" :key="index2" :prop="item2.prop" :label="item2.label"></el-table-column>
          </el-table>
          <template v-if="showIndex">
            <div style="display: flex;justify-content: left;align-items: center">
              <h3>索引信息</h3>
            </div>
            <el-table :data="item.tabsIndex" border style="width: 100%"
                      :header-cell-style="{
                      /*background:'#38a4ed',height:'50px',*/color:'#000000'
                    }">
              <el-table-column v-for="(item2,index2) in tableData.indexFieldList" :key="index2" :prop="item2.prop" :label="item2.label"></el-table-column>
            </el-table>
          </template>
        </div>
      </el-main>
      <el-backtop target=".my-content" :bottom="100">
        <div style="height: 100%;width: 100%;background-color: #f2f5f6;box-shadow: 0 0 6px rgba(0,0,0, .12);text-align: center;line-height: 40px;color: #1989fa;">UP</div>
      </el-backtop>
    </el-container>
  </el-container>
</template>
<script setup lang="ts">
import {ref,onMounted,getCurrentInstance,computed} from 'vue'
const { proxy } = getCurrentInstance() as any;
import { useRouter } from 'vue-router'
const router = useRouter();
const loading = ref<Boolean>(false);
const searchTableName = ref<string>('');

const columnSetList = ref<string>('');
const indexSetList = ref<string>('');
const showIndex = ref<number>(0);
const selectTableStr = ref<string>('')

const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}
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
interface tableDataDefine{
  tableDetailInfo: Array<tableDetailDefine>,
  fieldList: Array<genItemDefine>,
  indexFieldList: Array<genItemDefine>,
}
interface genItemDefine{
  prop: string,
  label: string
}
interface tableDetailDefine{
  tableName: string,
  tableComments: string,
  tabsColumn: Array<any>,
  tabsIndex: Array<any>,
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
onMounted(()=>{
  dbJsonParams.value = JSON.parse(atob(<string>router.currentRoute.value.query.base64Params));
  columnSetList.value = <string>router.currentRoute.value.query.columnSetList;
  indexSetList.value = <string>router.currentRoute.value.query.indexSetList;
  showIndex.value = Number(router.currentRoute.value.query.showIndex);
  selectTableStr.value = <string>router.currentRoute.value.query.selectTableStr;
  getTableList();
})
const selectOptions = computed(()=>{
  let data = tableData.value.tableDetailInfo;
  if (data == undefined) {
    return [];
  }
  let a = [];
  for (let i = 0; i < data.length; i++) {
    let text = data[i].tableName + '(' + data[i].tableComments + ')';
    if(searchTableName && text.indexOf(searchTableName.value) == -1){
      continue
    }
    a.push({"value": data[i].tableName, 'label': text});
  }
  return a;
})
const getTableList = async () => {
  try {
    loading.value = true;
    let postData = {}
    Object.assign(postData,dbJsonParams.value)
    Object.assign(postData,{
      columnSetList: columnSetList.value,
      indexSetList: indexSetList.value,
      showIndex: showIndex.value,
      selectTableStr: selectTableStr.value
    })
    const response = await proxy.$axios.post('/getTableData',postData);
    tableData.value = response.data.params;
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};
</script>

<style scoped lang="less">
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  background-color: rgba(241, 238, 238, 0.96);
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #ffffff;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  background-color: #c8c8c8;
}
</style>