import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import { WorkflowStorageHelper } from '../helpers/workflowStorageHelper';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: LandingPage,
      beforeEnter: (to, from, next) => {
        // Redirect to overview if user has saved workflows
        const workflows = WorkflowStorageHelper.getWorkflowStorage();

        if (workflows?.length) {
          return next('/overview');
        }

        return next();
      },
    },
    {
      path: '/check',
      name: 'Workflow checker',
      component: () => import('@/views/WorkflowChecker.vue'),
    },
    {
      path: '/overview',
      name: 'Workflow overview',
      component: () => import('@/views/WorkflowOverview.vue'),
    },
  ],
});

// attach route name to document title on route change
router.afterEach((to) => {
  document.title = `Can I CAI? | ${to.name?.toString()}`;
});

export default router;
