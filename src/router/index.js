import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import ParentsProfile from '@/views/Parents.vue'
import TeacherProfile from '@/views/TeacherProfile.vue'
import AdminProfile from '@/views/AdminProfile.vue'
import ControlDePagos from '@/views/ControlDePagos.vue'
import PaymentsControl from '@/views/PaymentsControl.vue'
import UploadPayments from '@/views/UploadPayments.vue'
import SuperUserCrud from '@/views/SuperUserCrud.vue'
import ManualPaymentsCrud from '@/views/ManualPaymentsCrud.vue'
import TeacherCourses from '@/views/TeacherCourses.vue'
import TeacherCoursesCrud from '@/views/TeacherCoursesCrud.vue'
import CourseDetail from '@/views/CourseDetail.vue'
import CourseGrades from '@/views/CourseGrades.vue'  
import CreateTaskForm from '@/views/CreateTaskForm.vue'
import ViewTasks from '@/views/ViewTasks.vue'
import ViewGrades from '@/views/ViewGrades.vue'
import HomeworkCalendar from '@/views/HomeworkCalendar.vue'
import StudentsObservations from '@/views/StudentsObservations.vue'
import AddObservations from '@/views/AddObservations.vue'
import ViewObservations from '@/views/ViewObservations.vue'
import AttendanceForm from '@/views/AttendanceForm.vue'
import MessageView from '@/views/MessageView.vue'
import ReportCardStudents from '@/views/ReportCardStudents.vue'
import ReportCard from '@/views/ReportCard.vue'
import DirectorProfile from '@/views/DirectorProfile.vue'

const routes = [
  { path: '/', name: 'Login', component: Login }, 
  { path: '/teacher', name: 'TeacherProfile', component: TeacherProfile },
  { path: '/admin', name: 'AdminProfile', component: AdminProfile },
  { path: '/parent', name: 'Parents', component: ParentsProfile },
  { path: '/admin/payments/control-de-pagos', name: 'ControlDePagos', component: ControlDePagos },
  { path: '/admin/payments/registro-de-pagos', name: 'ManualPayments', component: ManualPaymentsCrud },
  { path: '/admin/payments', name: 'PaymentsControl', component: PaymentsControl },
  { path: '/admin/payments/upload', name: 'UploadPayments', component: UploadPayments },
  { path: '/superuser', name: 'SuperUserCrud', component: SuperUserCrud },
  { 
    path: '/superuser/teacher-courses', 
    name: 'TeacherCoursesCrud', 
    component: TeacherCoursesCrud,
    meta: { requiresAuth: true }
  },
  { path: '/teacher/courses', name: 'TeacherCourses', component: TeacherCourses },
  { path: '/teacher/courses/:courseId', name: 'CourseDetail', component: CourseDetail, meta: { requiresAuth: true }, props: true},
  { path: '/teacher/courses/:courseId/grades', name: 'CourseGrades', component: CourseGrades,
  meta: { requiresAuth: true },
  props: true
  },
  { 
    path: '/teacher/courses/:courseId/create-task', 
    name: 'CreateTaskForm', 
    component: CreateTaskForm,
    meta: { requiresAuth: true },
    props: true
  },
  { 
    path: '/teacher/courses/:courseId/view-tasks', 
    name: 'ViewTasks', 
    component: ViewTasks,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/register-grade',
    name: 'RegisterGrade',
    component: () => import('@/views/RegisterGrade.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/view-grades',
    name: 'ViewGrades',
    component: ViewGrades,
    meta: { requiresAuth: true },
    props: true
  },
  { 
    path: '/teacher/calendar', 
    name: 'HomeworkCalendar', 
    component: HomeworkCalendar, 
    meta: { requiresAuth: true } 
  },
  {
    path: '/teacher/courses/:courseId/observations',
    name: 'StudentsObservations',
    component: StudentsObservations,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/observations/:carnet_estudiante/add',
    name: 'AddObservations',
    component: AddObservations,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/attendance',
    name: 'CourseAttendance',
    component: AttendanceForm,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/teacher/messages',
    name: 'TeacherMessages',
    component: MessageView,
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/courses/:courseId/students/:carnet_estudiante/observations',
    name: 'ViewObservations',
    component: () => ViewObservations,
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/report-card/',
    name: 'ReportCardStudents',
    component: ReportCardStudents,
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/report-card/:carnet_estudiante',
    name: 'ReportCard',
    component: ReportCard,
    meta: { requiresAuth: true }
  },
  {
    path: '/director',
    name: 'DirectorProfile',
    component: DirectorProfile,
    meta: { requiresAuth: true, roles: ['Director'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
