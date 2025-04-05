// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AdminPage from '../views/AdminPage.vue';
import ResultSearch from '../views/ResultSearch.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/admin', component: AdminPage },
  { path: '/result-search', component: ResultSearch},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;