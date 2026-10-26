import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { MascotasPageComponent } from './features/mascotas/pages/mascotas-page/mascotas-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'mascotas',
        pathMatch: 'full'
      },
      {
        path: 'mascotas',
        component: MascotasPageComponent
      },
      {
        path: '**',
        redirectTo: 'mascotas'
      }
    ]
  }
];
