import { Inject, Service, inject } from '@angular/core'

@Service()
export class CommonService {
  backendURL: string

  constructor () {
    const ssrBackendURL = inject<string>(Inject('BACKEND_URL'), { optional: true })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const tag = document.querySelector('meta[property=x-tabby-web-backend-url]')! as HTMLMetaElement
    if (ssrBackendURL) {
      this.backendURL = ssrBackendURL
      tag.content = ssrBackendURL
    } else {
      if (tag.content && !tag.content.startsWith('{{')) {
        this.backendURL = tag.content
      } else {
        this.backendURL = ''
      }
    }

    if (this.backendURL.endsWith('/')) {
      this.backendURL = this.backendURL.slice(0, -1)
    }
  }
}
