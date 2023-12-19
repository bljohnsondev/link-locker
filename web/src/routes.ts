import { Route } from '@vaadin/router';

import { authGuard, logout } from '@/features/auth';

// lit components for pages
import './features/auth/login-page';
import './features/error/error-page';
import './features/home/home-page';
import './features/home/pages/folder-page';
import './features/home/pages/tag-page';

/*
using an authGuard based on this article:
https://www.thisdot.co/blog/using-route-guards-actions-and-web-components/
*/

export const routes: Route[] = [
  {
    path: '/login',
    component: 'login-page',
  },
  {
    path: '/logout',
    action: logout,
  },
  {
    path: '/error/:errorCode',
    component: 'error-page',
  },
  {
    path: '/',
    component: 'home-page',
    children: [
      {
        path: '/',
        component: 'folder-page',
        action: authGuard,
      },
      {
        path: '/folder/:folderId',
        component: 'folder-page',
        action: authGuard,
      },
      {
        path: '/tag',
        component: 'tag-page',
        action: authGuard,
      },
      {
        path: '/tag/:tagId',
        component: 'tag-page',
        action: authGuard,
      },
    ],
  },
  { path: '(.*)', redirect: '/error/notfound' },
];
