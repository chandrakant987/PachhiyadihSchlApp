// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AdminPage from '../views/AdminPage.vue';
import ResultSearch from '../views/ResultSearch.vue';
import StudentAttendancePage from '../views/StudentAttendancePage.vue';
import Notifications from '../views/Notifications.vue';
import AttendanceDashboard from '../views/AttendanceDashboard.vue';
import HolidayManagement from '../views/HolidayManagement.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/admin', component: AdminPage },
  { path: '/result-search', component: ResultSearch},
  { path: '/mark-attendance', component: StudentAttendancePage},
  { path: '/view-notifications', component: Notifications},
  { path: '/attendace-dashboard', component: AttendanceDashboard},
  { path: '/holiday-management', component: HolidayManagement},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;