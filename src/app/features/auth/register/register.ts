import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, collection, setDoc, doc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  email = '';
  password = '';
  confirmPassword = '';
  displayName = '';
  errorMessage = '';

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);

  async register() {
    this.errorMessage = '';
    if (!this.email || !this.password || !this.confirmPassword || !this.displayName) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: this.displayName });

      await setDoc(doc(this.firestore, "users", user.uid), {
        uid: user.uid,
        email: this.email,
        displayName: this.displayName,
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
      });

      this.router.navigate(['/login']);
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'El correo electrónico ya está en uso.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'La contraseña es demasiado débil.';
          break;
        default:
          this.errorMessage = 'Ocurrió un error inesperado al registrar el usuario.';
          break;
      }
      console.error('Error al registrar usuario:', error);
    }
  }
}
