<template>
  <div class="main">
    <el-container style="height: 100%;width: 100%">
      <el-header class="header-div" height="100px">
        <div class="header-title">
          <div>
            <img class="logo-icon" alt="" src="@/assets/logo.png">
          </div>
          <div class="title">
            <span style="font-size: 46px;font-weight: bolder">{{projectName}}</span>
            <span style="margin-top: 10px">{{projectDescription}}{{projectVersion}}</span>
          </div>
        </div>
        <div class="header-link">
          <div style="margin-left: 20px;margin-top: -5px;">
            <el-switch
                v-model="theme"
                :active-action-icon="Moon"
                :inactive-action-icon="Sunny"
                inline-prompt
                @change="toggle"/>
          </div>
          <div style="margin-left: 20px;">
            <el-tooltip class="item" effect="dark" content="gitee" placement="bottom">
              <img alt="" onclick="window.open('https://gitee.com/pomz/database-export')" src="@/assets/images/gitee-icon.png">
            </el-tooltip>
          </div>
          <div style="margin-left: 20px;">
            <el-tooltip class="item" effect="dark" content="github" placement="bottom">
              <img alt="" onclick="window.open('https://github.com/PomZWJ/database-export/')" src="@/assets/images/gitHub-icon.png">
            </el-tooltip>
          </div>
        </div>
      </el-header>
      <el-main>
        <el-row>
          <mysql></mysql>
          <oracle></oracle>
          <sqlserver></sqlserver>
          <postgresql></postgresql>
          <clickhouse></clickhouse>
          <sqlite></sqlite>
          <db2></db2>
          <dm></dm>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue'
import PackageJson from '../../package.json'
const projectName = ref<String>(PackageJson.name);
const projectVersion = ref<String>(PackageJson.version)
const projectDescription = ref<String>(PackageJson.description)
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
import Mysql from "@/views/db/mysql.vue";
import Oracle from "@/views/db/oracle.vue";
import Sqlserver from "@/views/db/sqlserver.vue";
import Postgresql from "@/views/db/postgresql.vue";
import Clickhouse from "@/views/db/clickhouse.vue";
import Db2 from "@/views/db/db2.vue";
import Dm from "@/views/db/dm.vue";
import Sqlite from "@/views/db/sqlite.vue";

const theme = ref<boolean>(localStorage.getItem('useDarkKEY') === 'dark' ? true : false)

const isDark = useDark({
  // 存储到localStorage中的Key 根据自己的需求更改
  storageKey: 'useDarkKEY',
  // 暗黑class名字
  valueDark: 'dark',
  // 高亮class名字
  valueLight: 'light',
})

const toggle = useToggle(isDark);
</script>
<style scoped lang="less">
.main {
  margin: 20px 50px;

  .header-div {
    display: flex;
    flex-direction: row;

    .header-title {
      display: flex;
      flex-direction: row;
      width: 50%;

      .logo-icon {
        width: 100px;
        height: 100px
      }

      .title {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-left: 15px
      }
    }

    .header-link {
      width: 50%;
      display: flex;
      flex-direction: row-reverse;
      justify-items: center;
      align-items: center;

      img {
        width: 30px;
        height: 30px;
        cursor: pointer;
      }
    }
  }

}

</style>