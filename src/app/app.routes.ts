import { Routes } from '@angular/router';
import { AuthGuard } from './shared/authguard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../app/login/login').then((m) => m.Login),
  },
  {
    path: 'desktop',
    loadComponent: () =>
      import('../app/desktop/desktop').then((m) => m.Desktop),
    canActivate: [AuthGuard],
  },
];