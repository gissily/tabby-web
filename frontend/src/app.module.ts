/* eslint-disable @typescript-eslint/no-extraneous-class */
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { AppComponent } from './app.component'
import { CommonAppModule } from 'src/common'

import '@fortawesome/fontawesome-svg-core/styles.css'

const ROUTES = [
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

@NgModule({
  imports: [
    BrowserModule,
    CommonAppModule.forRoot(),
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ClipboardModule,
    RouterModule.forRoot(ROUTES),
  ],
})
export class AppModule { }
