import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import IndexPage from '../views/index.vue'
import PreviewPage from '../views/preview.vue'
// 定义路由
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Index',
        component: IndexPage
    },
    {
        path: '/preview',
        name: 'Preview',
        component: PreviewPage
    },
];

// 创建router实例
const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;