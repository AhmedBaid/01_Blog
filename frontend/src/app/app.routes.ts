import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { HomeComponent } from './components/home/home';


export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
  },

  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];
