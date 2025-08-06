import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Dictionary } from './features/dictionary/dictionary';
import { Stories } from './features/stories/stories';
import { Games } from './features/games/games';
import { Profile } from './features/profile/profile';
import { Lecciones } from './features/lecciones/lecciones';
import { Biblioteca } from './features/biblioteca/biblioteca';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ContribuirComponent } from './features/contribuir/contribuir';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'dictionary', component: Dictionary },
      { path: 'stories', component: Stories },
      { path: 'games', component: Games },
      { path: 'profile', component: Profile },
      { path: 'lecciones', component: Lecciones },
      { path: 'contribuir', component:ContribuirComponent  },
      { path: 'biblioteca', component: Biblioteca },
    ]
  }
];

