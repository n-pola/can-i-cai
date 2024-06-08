import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: LandingPage,
    },
    {
      path: '/check',
      name: 'WorkflowChecker',
      component: () => import('@/views/WorkflowChecker.vue'),
    },
  ],
});

export default router;
