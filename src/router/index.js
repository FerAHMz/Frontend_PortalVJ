import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware } from '@/middleware/auth.js'
import { USER_ROLES } from '@/utils/constants.js'

// Auth
import Login from '@/views/auth/Login.vue'


// Parent
import ParentsProfile from '@/views/parent/Parents.vue'
import ParentGrades from '@/views/parent/ParentGrades.vue'
import ParentTasks from '@/views/parent/ParentTasks.vue'
import ParentCalendar  from '@/views/parent/Calendar.vue'
import ParentMessages from '@/views/parent/Messages.vue'


// Teacher
import TeacherProfile from '@/views/teacher/TeacherProfile.vue'
import TeacherCourses from '@/views/teacher/TeacherCourses.vue'
import CourseDetail from '@/views/teacher/CourseDetail.vue'
import CourseGrades from '@/views/teacher/CourseGrades.vue'
import CreateTaskForm from '@/views/teacher/CreateTaskForm.vue'
import ViewTasks from '@/views/teacher/ViewTasks.vue'
import ViewGrades from '@/views/teacher/ViewGrades.vue'
import Calendar from '@/views/teacher/Calendar.vue'
import Observations from '@/views/teacher/Observations.vue'
import AddObservations from '@/views/teacher/AddObservations.vue'
import ViewObservations from '@/views/teacher/ViewObservations.vue'
import AttendanceForm from '@/views/teacher/AttendanceForm.vue'
import Messages from '@/views/teacher/Messages.vue'
import ReportCardStudents from '@/views/teacher/ReportCardStudents.vue'
import ReportCard from '@/views/teacher/ReportCard.vue'

// Admin
import AdminProfile from '@/views/admin/AdminProfile.vue'
import PaymentsDashboard from '@/views/admin/PaymentsDashboard.vue'
import PaymentsControl from '@/views/admin/PaymentsControl.vue'
import UploadPayments from '@/views/admin/UploadPayments.vue'
import ManualPayments from '@/views/admin/ManualPayments.vue'

// SuperUser
import SuperUserCrud from '@/views/superuser/SuperUserCrud.vue'
import SuperUserProfile from '@/views/superuser/SuperUserProfile.vue'
import TeacherCoursesCrud from '@/views/superuser/TeacherCoursesCrud.vue'

// Director
import DirectorProfile from '@/views/director/DirectorProfile.vue'

const routes = [
  // Rutas públicas
  {
    path: '/',
    name: 'Login',
    component: Login,
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

  // PARENT ROUTES
  {
    path: '/parent',
    name: 'Parents',
    component: ParentsProfile,
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
