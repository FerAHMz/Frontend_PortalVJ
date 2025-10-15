import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware } from '@/middleware/auth.js'
import { USER_ROLES } from '@/utils/constants.js'

// Auth
import Login from '@/views/auth/Login.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'


// Parent - Lazy Loading
const ParentsProfile = () => import('@/views/parent/Parents.vue')
const ParentGrades = () => import('@/views/parent/ParentGrades.vue')
const ParentTasks = () => import('@/views/parent/ParentTasks.vue')
const ParentCalendar = () => import('@/views/parent/Calendar.vue')
const ParentMessages = () => import('@/views/parent/Messages.vue')
const PaymentHistory = () => import('@/views/parent/PaymentHistory.vue')


// Teacher - Importación directa para mejor performance en desarrollo
import TeacherProfile from '@/views/teacher/TeacherProfile.vue'
import TeacherCourses from '@/views/teacher/TeacherCourses.vue'
import CourseDetail from '@/views/teacher/CourseDetail.vue'
import AttendanceForm from '@/views/teacher/AttendanceForm.vue'

// Lazy loading solo para vistas menos usadas
const CourseGrades = () => import('@/views/teacher/CourseGrades.vue')
const CreateTaskForm = () => import('@/views/teacher/CreateTaskForm.vue')
const ViewTasks = () => import('@/views/teacher/ViewTasks.vue')
const ViewGrades = () => import('@/views/teacher/ViewGrades.vue')
const Calendar = () => import('@/views/teacher/Calendar.vue')
const Observations = () => import('@/views/teacher/Observations.vue')
const AddObservations = () => import('@/views/teacher/AddObservations.vue')
const ViewObservations = () => import('@/views/teacher/ViewObservations.vue')
const Messages = () => import('@/views/teacher/Messages.vue')
const ReportCardStudents = () => import('@/views/teacher/ReportCardStudents.vue')
const ReportCard = () => import('@/views/teacher/ReportCard.vue')
const CoursePlanning = () => import('@/views/teacher/PlanningCourse.vue')
const PlanningTasks = () => import('@/views/teacher/PlanningTasks.vue')
const TeacherDashboard = () => import('@/views/teacher/TeacherDashboard.vue')

// Admin - Lazy Loading
const AdminProfile = () => import('@/views/admin/AdminProfile.vue')
const PaymentsDashboard = () => import('@/views/admin/PaymentsDashboard.vue')
const PaymentsControl = () => import('@/views/admin/PaymentsControl.vue')
const UploadPayments = () => import('@/views/admin/UploadPayments.vue')
const ManualPayments = () => import('@/views/admin/ManualPayments.vue')

// SuperUser - Lazy Loading
const SuperUserCrud = () => import('@/views/superuser/SuperUserCrud.vue')
const SuperUserProfile = () => import('@/views/superuser/SuperUserProfile.vue')
const TeacherCoursesCrud = () => import('@/views/superuser/TeacherCoursesCrud.vue')
const PlanificationsByGrade = () => import('@/views/superuser/PlanificationsByGrade.vue')
const FamilyManagement = () => import('@/views/superuser/FamilyManagement.vue')
const InscripcionesManagement = () => import('@/views/superuser/InscripcionesManagement.vue')

// Director - Lazy Loading
const DirectorProfile = () => import('@/views/director/DirectorProfile.vue')
const PlanningCourseDir = () => import('@/views/director/PlanningCourse.vue')
const PlanningTasksDir = () => import('@/views/director/PlanningTasks.vue')
const AcademicManagement = () => import('@/views/director/AcademicManagement.vue')
const DirectorReports = () => import('@/views/director/Reports.vue')
const DirectorStaff = () => import('@/views/director/Staff.vue')

const routes = [
  // Rutas públicas
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresAuth: false }
  },
  // PARENT ROUTES
  {
    path: '/parent',
    name: 'ParentsProfile',
    component: ParentsProfile,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.PARENT]
    }
  },
  {
    path: '/parent/grades',
    name: 'ParentGrades',
    component: ParentGrades,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.PARENT]
    }
  },
  {
    path: '/parent/tasks',
    name: 'ParentTasks',
    component: ParentTasks,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.PARENT]
    }
  },
  {
    path: '/parent/payments',
    name: 'PaymentHistory',
    component: PaymentHistory,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.PARENT]
    }
  },
  {
    path: '/parent/calendar',
    name: 'ParentCalendar',
    component: ParentCalendar,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.PARENT]
    }
  },
  {
    path: '/parent/messages',
    name: 'ParentMessages',
    component: ParentMessages,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.PARENT]
    }
  },

  // Rutas protegidas por rol

  // TEACHER ROUTES
  {
    path: '/teacher',
    name: 'TeacherProfile',
    component: TeacherProfile,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    }
  },
  {
    path: '/teacher/dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    }
  },
  {
    path: '/teacher/courses',
    name: 'TeacherCourses',
    component: TeacherCourses,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    }
  },
  {
    path: '/teacher/courses/:courseId',
    name: 'CourseDetail',
    component: CourseDetail,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/grades',
    name: 'CourseGrades',
    component: CourseGrades,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/create-task',
    name: 'CreateTaskForm',
    component: CreateTaskForm,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/view-tasks',
    name: 'ViewTasks',
    component: ViewTasks,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/register-grade',
    name: 'RegisterGrade',
    component: () => import('@/views/teacher/RegisterGrade.vue'),
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/view-grades',
    name: 'ViewGrades',
    component: ViewGrades,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/calendar',
    name: 'Calendar',
    component: Calendar,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    }
  },
  {
    path: '/teacher/courses/:courseId/observations',
    name: 'Observations',
    component: Observations,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/observations/:carnet_estudiante/add',
    name: 'AddObservations',
    component: AddObservations,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/attendance',
    name: 'CourseAttendance',
    component: AttendanceForm,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/messages',
    name: 'Messages',
    component: Messages,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    }
  },
  {
    path: '/teacher/courses/:courseId/students/:carnet_estudiante/observations',
    name: 'ViewObservations',
    component: ViewObservations,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/report-card/',
    name: 'ReportCardStudents',
    component: ReportCardStudents,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    }
  },
  {
    path: '/teacher/report-card/:carnet_estudiante',
    name: 'ReportCard',
    component: ReportCard,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
 {
    path: '/teacher/courses/:courseId/planning',
    name: 'CoursePlanning',
    component: CoursePlanning,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },
  {
    path: '/teacher/courses/:courseId/planning/:planId/tasks',
    name: 'CoursePlanningTasks',
    component: PlanningTasks,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.TEACHER]
    },
    props: true
  },

  // ADMIN ROUTES
  {
    path: '/admin',
    name: 'AdminProfile',
    component: AdminProfile,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.ADMIN]
    }
  },
  {
    path: '/admin/payments/dashboard',
    name: 'PaymentsDashboard',
    component: PaymentsDashboard,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.ADMIN]
    }
  },
  {
    path: '/admin/payments/manual',
    name: 'ManualPayments',
    component: ManualPayments,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.ADMIN]
    }
  },
  {
    path: '/admin/payments',
    name: 'PaymentsControl',
    component: PaymentsControl,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.ADMIN]
    }
  },
  {
    path: '/admin/payments/upload',
    name: 'UploadPayments',
    component: UploadPayments,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.ADMIN]
    }
  },

  // SUPERUSER ROUTES
  {
    path: '/superuser',
    name: 'SuperUserCrud',
    component: SuperUserCrud,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.SUPER_USER]
    }
  },
  {
    path: '/superuser/profile',
    name: 'SuperUserProfile',
    component: SuperUserProfile,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.SUPER_USER]
    }
  },
  {
    path: '/superuser/teacher-courses',
    name: 'TeacherCoursesCrud',
    component: TeacherCoursesCrud,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.SUPER_USER]
    }
  },
  {
    path: '/superuser/planifications',
    name: 'PlanificacionesByGrade',
    component: PlanificationsByGrade,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.SUPER_USER]
    }
  },
  {
    path: '/superuser/families',
    name: 'FamilyManagement',
    component: FamilyManagement,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.SUPER_USER]
    }
  },
  {
    path: '/superuser/inscripciones',
    name: 'InscripcionesManagement',
    component: InscripcionesManagement,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.SUPER_USER]
    }
  },

  // DIRECTOR ROUTES
  {
    path: '/director',
    name: 'DirectorProfile',
    component: DirectorProfile,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.DIRECTOR]
    }
  },
  {
    path: '/director/academic',
    name: 'AcademicManagement',
    component: AcademicManagement,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.DIRECTOR]
    }
  },
  {
    path: '/director/planning/:courseId',
    name: 'PlanningCourseDir',
    component: PlanningCourseDir,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.DIRECTOR]
    }
  },
  {
    path: '/director/planning/:courseId/tasks/:planId',
    name: 'PlanningTasksDir',
    component: PlanningTasksDir,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.DIRECTOR]
    }
  },
  {
    path: '/director/reports',
    name: 'DirectorReports',
    component: DirectorReports,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.DIRECTOR]
    }
  },
  {
    path: '/director/staff',
    name: 'DirectorStaff',
    component: DirectorStaff,
    meta: {
      requiresAuth: true,
      roles: [USER_ROLES.DIRECTOR]
    }
  },


  // Backward compatibility routes (redirects)
  {
    path: '/admin/payments/control-de-pagos',
    redirect: '/admin/payments/dashboard'
  },
  {
    path: '/admin/payments/registro-de-pagos',
    redirect: '/admin/payments/manual'
  },
  {
    path: '/teacher/calendar',
    redirect: '/teacher/calendar'
  },

  // Ruta de captura para rutas no encontradas
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Aplicar middleware de autenticación a todas las rutas
router.beforeEach(authMiddleware)

export default router
