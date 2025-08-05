import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private auth: Auth = inject(Auth);
  private authService = inject(AuthService);
  private router = inject(Router);

  isDropdownOpen = false;

  user$ = user(this.auth);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
