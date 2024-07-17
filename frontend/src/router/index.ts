import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { WorkflowStorageHelper } from '@/helpers/workflowStorageHelper';
import { useToast } from 'vue-toastification';
import { i18n } from '@/utils/i18n';
import { getSharedWorkflow } from '@/api/workflow';
import { useGlobalStore } from '@/stores/global';
import { config } from '@/config';

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
      name: 'Workflow Checker',
      component: () => import('@/views/WorkflowChecker.vue'),
      beforeEnter: async (to, from, next) => {
        const workflowStore = useWorkflowStore();
        const currentWorkflow = WorkflowStorageHelper.getCurrentWorkflow();
        workflowStore.clearWorkflow();

        if (currentWorkflow) {
          const globalStore = useGlobalStore();
          try {
            globalStore.spinnerVisible = true;
            await workflowStore.loadFromLocalStorage(currentWorkflow);
            document.title = `${config.documentTitleBase} | ${workflowStore.name}`;
          } catch (error) {
            toast.error(i18n.t('workflowNotFound'));
            WorkflowStorageHelper.clearCurrentWorkflow();
          } finally {
            globalStore.spinnerVisible = false;
          }
        }

        return next();
      },
    },

    {
      path: '/check/new',
      name: 'New Workflow',
      redirect: () => {
        WorkflowStorageHelper.clearCurrentWorkflow();
        return '/check';
      },
    },

    {
      path: '/check/shared/:id',
      name: 'Shared Workflow',
      component: () => import('@/views/WorkflowChecker.vue'),
      beforeEnter: async (to, from, next) => {
        const workflowStore = useWorkflowStore();
        const globalStore = useGlobalStore();
        try {
          globalStore.spinnerVisible = true;
          const workflow = await getSharedWorkflow(to.params.id as string);
          await workflowStore.reconstructWorkflow(workflow);
          return next();
        } catch (error) {
          toast.error(i18n.t('workflowNotFound'));
          return next('/404');
        } finally {
          globalStore.spinnerVisible = false;
        }
      },
    },

    {
      path: '/overview',
      name: 'Workflow overview',
      component: () => import('@/views/WorkflowOverview.vue'),
    },
    {
      path: '/privacy',
      name: 'Privacy policy',
      component: () => import('@/views/PrivacyPolicy.vue'),
    },
    {
      path: '/imprint',
      name: 'Imprint',
      component: () => import('@/views/ImprintView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'Not Found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
});

// attach route name to document title on route change
router.beforeEach((to) => {
  document.title = `${config.documentTitleBase} | ${to.name?.toString()}`;
});

export default router;
