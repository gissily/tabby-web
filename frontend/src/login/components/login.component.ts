import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { LoginService, CommonService } from 'src/common'

import { faGithub, faGitlab, faGoogle, faMicrosoft, faOpenid, IconDefinition } from '@fortawesome/free-brands-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'

interface Provider {
  id: string
  name: string
  icon: string
  cls: string
}

// Map icon names from backend to FontAwesome icons
const iconMap: Record<string, IconDefinition> = {
  github: faGithub,
  gitlab: faGitlab,
  google: faGoogle,
  microsoft: faMicrosoft,
  openid: faOpenid,  // Used for generic OIDC providers (Authentik, Authelia, Keycloak, etc.)
  key: faKey,  // Used for Auth0 and other providers without brand icons
}

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loggedIn: any
  ready = signal(false)
  providers: (Provider & { faIcon: IconDefinition })[] = []

  constructor (
    private http: HttpClient,
    private loginService: LoginService,
    public commonService: CommonService,
  ) { }

  async ngOnInit (): Promise<void> {
    // Fetch available providers from backend
    try {
      const providers = await firstValueFrom(this.http.get<Provider[]>('/api/1/auth/providers'))
      this.providers = (providers || []).map(p => ({
        ...p,
        faIcon: iconMap[p.icon] || faKey,
      }))
    } catch {
      // Fallback to empty list if API fails
      this.providers = []
    }

    await firstValueFrom(this.loginService.ready$)
    this.loggedIn = !!this.loginService.user
    this.ready.set(true)
  }
}
