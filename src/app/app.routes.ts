import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { MascotasPageComponent } from './features/mascotas/pages/mascotas-page/mascotas-page.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'mascotas',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/admin',
        redirectTo: 'mascotas',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/veterinario',
        redirectTo: 'mascotas',
        pathMatch: 'full'
      },
      {
        path: 'mascotas',
        component: MascotasPageComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
