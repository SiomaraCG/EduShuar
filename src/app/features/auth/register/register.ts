import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, collection, setDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  email = '';
  password = '';
  displayName = '';
  role = '';

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router = inject(Router);

  async register() {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;

      // Actualizar el perfil del usuario de Firebase Authentication con el displayName
      await updateProfile(user, { displayName: this.displayName });

      // Guardar información adicional del usuario en Firestore 
      await setDoc(doc(this.firestore, "users", user.uid), {
        uid: user.uid,
        email: this.email,
        password:this.password,
        displayName: this.displayName,
        role: this.role,
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
      });

      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  }
}
