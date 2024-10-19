import { createRouter, createWebHistory } from 'vue-router'
import AppVue from '@/App.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: AppVue
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
