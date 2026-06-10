import { createRouter } from '@tanstack/react-router';
import type { RouterContext } from './routerContext';
import { routeTree } from '@/router/routeTree.gen';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

export const router = createRouter({
  routeTree,
  context: {} as RouterContext, // fourni au rendu
  defaultNotFoundComponent: NotFoundPage,
});

