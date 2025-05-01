// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/auth';
import HomePage from '../views/HomePage.vue';
import AdminPage from '../views/AdminPage.vue';
import ResultSearch from '../views/ResultSearch.vue';
import StudentAttendancePage from '../views/StudentAttendancePage.vue';
import Notifications from '../views/Notifications.vue';
import AttendanceDashboard from '../views/AttendanceDashboard.vue';
import HolidayManagement from '../views/HolidayManagement.vue';
import StudentAttendance from '../views/StudentAttendance.vue';
import StudentPage from '../views/StudentPage.vue';
import StudentQuiz from '../views/StudentQuiz.vue';
import StudentsResults from '../views/StudentsResults.vue';
import DeleteAttendance from '../components/DeleteAttendance.vue';

const routes = [
  { path: '/', component: HomePage },
  { 
    path: '/admin',
    component: AdminPage,
    meta: { requiresAuth: true, role: 'admin' }, 
  },
  { path: '/result-search', component: ResultSearch},
  { 
    path: '/mark-attendance',
    component: StudentAttendancePage,
    meta: { requiresAuth: true, role: ['student', 'teacher', 'admin']},
  },
  { path: '/view-notifications', component: Notifications},
  { 
    path: '/attendance-dashboard',
    component: AttendanceDashboard,
    meta: { requiresAuth: true, role: ['student', 'teacher', 'admin']},
  },
  { 
    path: '/holiday-management',
    component: HolidayManagement,
    meta: { requiresAuth: true, role: ['student', 'teacher', 'admin']},
  },
  { path: '/holiday-list', component: HolidayManagement},
  {
    path: '/student-page',
    name: 'StudentPage',
    component: StudentPage
  },
  {
    path: '/student-attendance',
    name: 'StudentAttendance',
    component: StudentAttendance
  },
  {
    path: '/student-quiz',
    name: 'StudentQuiz',
    component: StudentQuiz
  },
  {
    path: '/student-results',
    name: 'StudentResults',
    component: StudentsResults
  },
  {
    path: '/delete-attendance',
    name: 'DeleteAttendace',
    component: DeleteAttendance
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Wait for auth initialization if not done
  if (!authService.isInitialized) {
    await authService.initialize();
  }

  const user = authService.currentUser;
  const role = authService.currentRole;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRole = to.matched[0]?.meta.role;

  if (requiresAuth && !user) {
    next('/');
  } else if (requiredRole && !requiredRole.includes(role)) {
    next('/');
  } else {
    next();
  }
});

export default router;