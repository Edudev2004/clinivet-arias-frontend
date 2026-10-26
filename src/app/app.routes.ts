import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { MascotasPageComponent } from './features/mascotas/pages/mascotas-page/mascotas-page.component';
import { ModulePlaceholderComponent } from './shared/components/module-placeholder/module-placeholder.component';

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
        path: 'dashboard',
        component: ModulePlaceholderComponent,
        data: { title: 'Panel Principal (Dashboard)' }
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
      },
      {
        path: 'citas',
        component: ModulePlaceholderComponent,
        data: { title: 'Agenda de Citas' }
      },
      {
        path: 'inventario',
        component: ModulePlaceholderComponent,
        data: { title: 'Inventario de Medicamentos e Insumos' }
      },
      {
        path: 'reportes',
        component: ModulePlaceholderComponent,
        data: { title: 'Reportes y Estadísticas' }
      },
      {
        path: '**',
        redirectTo: 'mascotas'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
