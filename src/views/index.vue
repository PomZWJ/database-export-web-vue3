<template>
  <div class="main">
    <el-container style="height: 100%;width: 100%">
      <el-header class="header-div" height="100px">
        <div class="header-title">
          <div>
            <img class="logo-icon" alt="img" src="@/assets/logo.png">
          </div>
          <div class="title">
            <span style="font-size: 46px;font-weight: bolder">{{projectName}}</span>
            <span style="margin-top: 10px">{{projectDescription}}{{projectVersion}}</span>
          </div>
        </div>
        <div class="header-link">
          <div style="margin-left: 20px;">
            <el-tooltip class="item" effect="dark" content="gitee" placement="bottom">
              <img alt="img" onclick="window.open('https://gitee.com/pomz/database-export')" src="@/assets/images/gitee-icon.png">
            </el-tooltip>
          </div>
          <div style="margin-left: 20px;">
            <el-tooltip class="item" effect="dark" content="github" placement="bottom">
              <img alt="img" onclick="window.open('https://github.com/PomZWJ/database-export/')" src="@/assets/images/gitHub-icon.png">
            </el-tooltip>
          </div>
        </div>
      </el-header>
      <el-aside width="200px" height="100%" style="background-color: rgb(238, 241, 246)">
      </el-aside>
      <el-main>
        <el-row>
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