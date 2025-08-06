import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile {
  activeTab: string = 'perfil';
  isEditing: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  user = {
    name: 'Nodexac490',
    role: 'Estudiante',
    bio: 'Estudiante de medicina tradicional Shuar. Me apasiona preservar nuestros conocimientos ancestrales y compartir la sabiduría de mi pueblo con el mundo.',
    avatar: '👤',
    level: 8,
    points: 1247
  };

  preferences = {
    language: 'es',
    theme: 'claro'
  };

  privacy = {
    shareProgress: true,
    shareData: true
  };

  // To hold the original state while editing
  private originalUser = { ...this.user };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleEditMode() {
    if (!this.isEditing) {
      // Entering edit mode, save current state
      this.originalUser = { ...this.user };
    }
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    // Here you would typically save the data to a backend service
    console.log('Perfil guardado:', this.user);
    this.isEditing = false;
  }

  cancelEdit() {
    // Revert to the original state
    this.user = { ...this.originalUser };
    this.isEditing = false;
  }

  setTheme(theme: string) {
    this.preferences.theme = theme;
  }

  toggleShareProgress() {
    this.privacy.shareProgress = !this.privacy.shareProgress;
  }

  toggleShareData() {
    this.privacy.shareData = !this.privacy.shareData;
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}