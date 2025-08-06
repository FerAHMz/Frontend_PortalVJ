// Constantes del sistema
export const USER_ROLES = {
  SUPER_USER: 'SUP',
  DIRECTOR: 'Director',
  ADMIN: 'Administrativo',
  TEACHER: 'Maestro',
  PARENT: 'Padre'
}

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_USER]: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'courses.manage',
    'all.access'
  ],
  [USER_ROLES.DIRECTOR]: [
    'reports.view',
    'academic.supervise',
    'users.view'
  ],
  [USER_ROLES.ADMIN]: [
    'payments.manage',
    'students.view',
    'reports.generate'
  ],
  [USER_ROLES.TEACHER]: [
    'courses.teach',
    'tasks.manage',
    'grades.manage',
    'attendance.manage',
    'observations.manage',
    'messages.send'
  ],
  [USER_ROLES.PARENT]: [
    'student.view',
    'grades.view',
    'messages.receive'
  ]
}

export const PROTECTED_ROUTES = {
  [USER_ROLES.SUPER_USER]: ['/superuser'],
  [USER_ROLES.DIRECTOR]: ['/director'],
  [USER_ROLES.ADMIN]: ['/admin'],
  [USER_ROLES.TEACHER]: ['/teacher'],
  [USER_ROLES.PARENT]: ['/parent']
}

export const API_BASE_URL = 'http://localhost:3000/api'
