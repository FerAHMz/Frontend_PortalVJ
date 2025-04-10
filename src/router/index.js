import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import ParentsProfile from '@/views/Parents.vue'
import TeacherProfile from '@/views/TeacherProfile.vue'
import AdminProfile from '@/views/AdminProfile.vue'
import ControlDePagos from '@/views/ControlDePagos.vue'
import PaymentsControl from '@/views/PaymentsControl.vue'
import UploadPayments from '@/views/UploadPayments.vue'

const routes = [
  { path: '/', name: 'Login', component: Login }, 
  { path: '/teacher', name: 'TeacherProfile', component: TeacherProfile },
  { path: '/admin', name: 'AdminProfile', component: AdminProfile },
  { path: '/parent', name: 'Parents', component: ParentsProfile },
  { path: '/admin/payments/control-de-pagos', name: 'ControlDePagos', component: ControlDePagos },
  { path: '/admin/payments', name: 'PaymentsControl', component: PaymentsControl },
  { path: '/admin/payments/upload', name: 'UploadPayments', component: UploadPayments }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
