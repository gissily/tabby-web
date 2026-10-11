import { bootstrapApplication } from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'
import { provideRouter, Routes } from '@angular/router'
import { AppComponent } from './app.component'

const ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./app').then(m => m.ApplicationModule),
  },
  {
    path: 'app',
    redirectTo: '/',
  },
  {
    path: 'login',
    loadChildren: () => import('./login').then(m => m.LoginModule),
  },
]

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(ROUTES),
  ],
}).catch(err => console.error(err))
