import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../views/Landing.vue';
import Playground from '../views/Playground.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Landing,
    },
    {
      path: '/playground',
      name: 'playground',
      component: Playground,
    },
  ],
});

export default router;
