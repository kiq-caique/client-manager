import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-clients-layout',
  templateUrl: './clients-layout.component.html',
  styleUrls: ['./clients-layout.component.scss']
})
export class ClientsLayoutComponent {
  user$ = this.auth.currentUser$;
  theme$ = this.theme.theme$;

  constructor(
    private auth: AuthService,
    private router: Router,
    private theme: ThemeService
  ) {}

  logout(): void { this.auth.logout(); }

  goToNew(): void { this.router.navigate(['/clients/new']); }

  toggleTheme(): void { this.theme.toggle(); }
}
