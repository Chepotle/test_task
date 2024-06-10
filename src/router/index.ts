import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import TableView from '../views/TableView.vue'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'home',
		component: TableView
	},
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
})

export default router
