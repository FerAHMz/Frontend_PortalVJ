import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import ParentsProfile from '@/views/Parents.vue'
import TeacherProfile from '@/views/TeacherProfile.vue'
import AdminProfile from '@/views/AdminProfile.vue'
import ControlDePagos from '@/views/ControlDePagos.vue'

const routes = [
  { path: '/', name: 'Login', component: Login }, 
  { path: '/teacher', name: 'TeacherProfile', component: TeacherProfile },
  { path: '/admin', name: 'AdminProfile', component: AdminProfile },
  { path: '/parent', name: 'Parents', component: ParentsProfile },
  { path: '/control-de-pagos', name: 'ControlDePagos', component: ControlDePagos },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
