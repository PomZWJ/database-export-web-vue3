import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import axios from 'axios';
// 全局配置axios请求根路径(axios.默认配置.请求根路径)
// 设置请求的全局地址
let apiClient;
if(process.env.NODE_ENV == 'production'){
    apiClient = axios.create({
        baseURL: window.location.protocol+'//'+window.location.host
    })
} else {
    apiClient = axios.create({
        baseURL: 'http://localhost:9999/'
    })
}

const app = createApp(App)
app.use(ElementPlus)
// 将axios实例挂载到Vue的原型上，方便全局使用
app.config.globalProperties.$axios = apiClient;
app.mount('#app')


