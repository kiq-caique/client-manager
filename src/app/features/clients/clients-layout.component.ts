import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-clients-layout',
  templateUrl: './clients-layout.component.html',
  styleUrls: ['./clients-layout.component.scss']
})
export class ClientsLayoutComponent {
  user$ = this.auth.currentUser$;

  constructor(private auth: AuthService, private router: Router) {}

  logout(): void { this.auth.logout(); }

  goToNew(): void { this.router.navigate(['/clients/new']); }
}
