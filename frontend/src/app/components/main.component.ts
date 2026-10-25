import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Title } from '@angular/platform-browser'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { AppConnectorService } from '../services/appConnector.service'

import { faGear, faExclamationTriangle, faFile, faPlus, faSave, faRightToBracket, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { SettingsModalComponent } from './settingsModal.component'
import { ConfigModalComponent } from './configModal.component'
import { ConfigService, LoginService } from 'src/common'
import { combineLatest, firstValueFrom } from 'rxjs'
import { Config, Version } from 'src/api'

@Component({
  selector: 'main',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  _logo = 'assets/logo.svg'
  _settingsIcon = faGear
  _loginIcon = faRightToBracket
  _logoutIcon = faRightFromBracket
  _addIcon = faPlus
  _configIcon = faFile
  _saveIcon = faSave
  _warningIcon = faExclamationTriangle

  showApp = false
  noVersionsAdded = false
  missingVersion: string|undefined

  @ViewChild('iframe') iframe: ElementRef

  constructor (
    titleService: Title,
    public appConnector: AppConnectorService,
    private http: HttpClient,
    public loginService: LoginService,
    private ngbModal: NgbModal,
    private config: ConfigService,
  ) {
    titleService.setTitle('Tabby')
    window.addEventListener('message', this.connectorRequestHandler)
    config.ready$.subscribe(() => {
      this.noVersionsAdded = config.configs.length === 0
    })
  }

  connectorRequestHandler = event => {
    if (event.data === 'request-connector') {
      this.iframe.nativeElement.contentWindow['__connector__'] = this.appConnector
      this.iframe.nativeElement.contentWindow.postMessage('connector-ready', '*')
    }
  }

  async ngAfterViewInit () {
    await firstValueFrom(this.loginService.ready$)

    combineLatest(
      [this.config.activeConfig$, this.config.activeVersion$],
    ).subscribe(([config, version]) => {
      this.reloadApp(config, version)
    })

    await firstValueFrom(this.config.ready$)
    await this.config.selectDefaultConfig()
  }

  ngOnDestroy () {
    window.removeEventListener('message', this.connectorRequestHandler)
  }

  unloadApp () {
    this.showApp = false
    this.iframe.nativeElement.src = 'about:blank'
  }

  async loadApp (config, version) {
    this.showApp = true
    this.iframe.nativeElement.src = '/terminal'
    if (this.loginService.user) {
      await firstValueFrom(this.http.patch(`/api/1/configs/${config.id}`, {
        last_used_with_version: version.version,
      }))
    }
  }

  reloadApp (config: Config, version?: Version) {
    if (!version) {
      this.missingVersion = config.last_used_with_version
      version = this.config.getLatestStableVersion()
      if (!version) {
        return
      }
    }
    this.missingVersion = undefined
    // TODO check config incompatibility
    setTimeout(() => {
      this.appConnector.setState(config, version)
      this.loadApp(config, version)
    })
  }

  async openConfig () {
    await this.ngbModal.open(ConfigModalComponent).result
  }

  async openSettings () {
    await this.ngbModal.open(SettingsModalComponent).result
  }

  async logout () {
    await firstValueFrom(this.http.post('/api/1/auth/logout', null))
    location.href = '/'
  }
}
