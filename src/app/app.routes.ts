import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
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
    path: 'no-autorizado',
    loadComponent: () =>
      import('./features/auth/pages/no-autorizado/no-autorizado.component').then((m) => m.NoAutorizadoComponent)
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
        canActivate: [roleGuard(['ADMIN', 'ADMINISTRADOR'])],
        component: ModulePlaceholderComponent,
        data: { title: 'Panel de Administración' }
      },
      {
        path: 'dashboard/recepcionista',
        canActivate: [roleGuard(['RECEPCIONISTA', 'ADMIN', 'ADMINISTRADOR'])],
        component: ModulePlaceholderComponent,
        data: { title: 'Panel de Recepción' }
      },
      {
        path: 'dashboard/veterinario',
        canActivate: [roleGuard(['VETERINARIO'])],
        component: ModulePlaceholderComponent,
        data: { title: 'Panel Clínico Veterinario' }
      },
      {
        path: 'dashboard/inventario',
        canActivate: [roleGuard(['ENCARGADO_INVENTARIO', 'ADMIN', 'ADMINISTRADOR'])],
        component: ModulePlaceholderComponent,
        data: { title: 'Panel de Control de Inventario' }
      },
      {
        path: 'mascotas',
        canActivate: [roleGuard(['ADMIN', 'ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'])],
        component: MascotasPageComponent
      },
      {
        path: 'propietarios',
        canActivate: [roleGuard(['ADMIN', 'ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'])],
        loadComponent: () =>
          import('./features/propietarios/pages/propietarios-page/propietarios-page.component').then(
            (m) => m.PropietariosPageComponent
          )
      },
      {
        path: 'citas',
        canActivate: [roleGuard(['ADMIN', 'ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'])],
        component: ModulePlaceholderComponent,
        data: { title: 'Agenda de Citas' }
      },
      {
        path: 'inventario',
        canActivate: [roleGuard(['ADMIN', 'ADMINISTRADOR', 'ENCARGADO_INVENTARIO'])],
        component: ModulePlaceholderComponent,
        data: { title: 'Inventario de Medicamentos e Insumos' }
      },
      {
        path: 'reportes',
        canActivate: [roleGuard(['ADMIN', 'ADMINISTRADOR'])],
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
