/* eslint-disable @typescript-eslint/no-extraneous-class */
import { ModuleWithProviders, NgModule } from '@angular/core'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { BackendXsrfInterceptor, UniversalInterceptor } from './interceptor'

@NgModule({
  imports: [],
})
export class CommonAppModule {
  static forRoot (): ModuleWithProviders<CommonAppModule> {
    return {
      ngModule: CommonAppModule,
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true },
      ],
    }
  }
}

export { LoginService } from './services/login.service'
export { ConfigService } from './services/config.service'
export { CommonService } from './services/common.service'
