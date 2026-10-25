import { provideZoneChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http'
import { provideRouter, Routes } from '@angular/router'
import { AppComponent } from './app.component'
import { UniversalInterceptor } from './common/interceptor'

const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./app/components/main.component').then(m => m.MainComponent),
  },
  {
    path: 'app',
    redirectTo: '/',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/components/login.component').then(m => m.LoginComponent),
  },
]

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true },
    provideRouter(ROUTES),
  ],
}).catch((err: unknown) => console.error(err))
