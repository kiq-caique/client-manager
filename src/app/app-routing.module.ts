import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'clients',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/clients/clients.module').then(m => m.ClientsModule)
  },
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  { path: '**', redirectTo: 'clients' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
