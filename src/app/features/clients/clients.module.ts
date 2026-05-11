import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ClientsLayoutComponent } from './clients-layout.component';
import { ClientListPageComponent } from './pages/list/client-list-page.component';
import { ClientFormPageComponent } from './pages/form/client-form-page.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsLayoutComponent,
    children: [
      { path: '', component: ClientListPageComponent },
      { path: 'new', component: ClientFormPageComponent },
      { path: ':id/edit', component: ClientFormPageComponent }
    ]
  }
];

@NgModule({
  declarations: [
    ClientsLayoutComponent,
    ClientListPageComponent,
    ClientFormPageComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ClientsModule {}
