import { Component, OnInit, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav implements OnInit {
  private authService = inject(AuthService);
  userName: string | null = null;

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.displayName;
      } else {
        this.userName = null;
      }
    });
  }
}
