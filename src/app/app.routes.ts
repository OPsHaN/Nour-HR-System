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
      import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'desktop',
    loadComponent: () =>
      import('./shared/components/desktop/desktop').then((m) => m.Desktop),
    canActivate: [AuthGuard],
  },
];