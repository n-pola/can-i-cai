import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import { useToast } from 'vue-toastification';
import { i18n } from '@/utils/i18n';

const toast = useToast();

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
      beforeEnter: (to, from, next) => {
        const workflowStore = useWorkflowStore();
        workflowStore.clearWorkflow();
        next();
      },
      children: [
        {
          path: ':id',
          name: 'Workflow checker',
          component: () => import('@/views/WorkflowChecker.vue'),
          beforeEnter: async (to, from, next) => {
            try {
              const workflowStore = useWorkflowStore();
              await workflowStore.loadFromLocalStorage(to.params.id as string);
              return next();
            } catch (error) {
              toast.error(i18n.t('workflowNotFound'));
              return next('/');
            }
          },
        },
      ],
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
