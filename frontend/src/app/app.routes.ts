import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { HomeComponent } from './components/home/home';
import { guestGuard } from './core/guards/guestGuard.guard';
import { authGuard } from './core/guards/authGuard.guard';
import { ProfileComponent } from './components/profile/profile';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },

  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile/me',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
