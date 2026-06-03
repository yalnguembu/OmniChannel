import { createRouter } from '@tanstack/react-router';
import type { RouterContext } from './routerContext';
import { routeTree } from '@/router/routeTree.gen';

export const router = createRouter({
  routeTree,
  context: {} as RouterContext, // fourni au rendu
});

