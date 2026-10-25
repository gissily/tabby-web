import semverCompare from 'semver/functions/compare-loose'
import { AsyncSubject, Subject, firstValueFrom } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Service, inject } from '@angular/core'
import { Config, User, Version } from '../../api'
import { LoginService } from './login.service'


@Service()
export class ConfigService {
  activeConfig$ = new Subject<Config>()
  activeVersion$ = new Subject<Version>()
  user: User

  configs: Config[] = []
  versions: Version[] = []
  ready$ = new AsyncSubject<void>()

  get activeConfig (): Config | null { return this._activeConfig }
  get activeVersion (): Version | null { return this._activeVersion }

  private _activeConfig: Config|null = null
  private _activeVersion: Version|null = null

  private readonly http = inject(HttpClient)
  private readonly loginService = inject(LoginService)

  constructor () {
    this.init()
  }

  async updateUser (): Promise<void> {
    if (!this.loginService.user) {
      return
    }
    await firstValueFrom(this.http.put('/api/1/user', this.user))
  }

  async createNewConfig (): Promise<Config> {
    const configData = {
      content: '{}',
      last_used_with_version: this._activeVersion?.version ?? this.getLatestStableVersion()?.version ?? '0.0.0',
    }
    if (!this.loginService.user) {
      const config = {
        id: Date.now(),
        name: `Temporary config at ${new Date()}`,
        created_at: new Date(),
        modified_at: new Date(),
        ...configData,
      }
      this.configs.push(config)
      return config
    }
    const config = await firstValueFrom(this.http.post<Config>('/api/1/configs', configData))
    this.configs.push(config)
    return config
  }

  getLatestStableVersion (): Version|undefined {
    return this.versions[0]
  }

  async duplicateActiveConfig (): Promise<void> {
    let copy: any = { ...this._activeConfig, id: undefined }
    if (this.loginService.user) {
      copy = await firstValueFrom(this.http.post<Config>('/api/1/configs', copy))
    }
    this.configs.push(copy)
  }

  async selectVersion (version: Version): Promise<void> {
    this._activeVersion = version
    this.activeVersion$.next(version)
  }

  async selectConfig (config: Config): Promise<void> {
    // TODO ask to upgrade
    const matchingVersion = this.versions.find(x => x.version === config.last_used_with_version) ?? this.versions[0]

    this._activeConfig = config
    this.activeConfig$.next(config)
    this.selectVersion(matchingVersion)
    if (this.loginService.user) {
      this.loginService.user.active_config = config.id
      await this.loginService.updateUser()
    }
  }

  async selectDefaultConfig (): Promise<void> {
    await firstValueFrom(this.ready$)
    await firstValueFrom(this.loginService.ready$)
    this.selectConfig(this.configs.find(c => c.id === this.loginService.user?.active_config) ?? this.configs[0])
  }

  async deleteConfig (config: Config): Promise<void> {
    if (this.loginService.user) {
      await firstValueFrom(this.http.delete(`/api/1/configs/${config.id}`))
    }
    this.configs = this.configs.filter(x => x.id !== config.id)
  }

  private async init () {
    await firstValueFrom(this.loginService.ready$)

    if (this.loginService.user) {
      this.configs = await firstValueFrom(this.http.get<Config[]>('/api/1/configs'))
    }
    this.versions = await firstValueFrom(this.http.get<Version[]>('/api/1/versions'))
    this.versions.sort((a, b) => -semverCompare(a.version, b.version))

    if (!this.configs.length && this.versions.length) {
      await this.createNewConfig()
    }

    this.ready$.next()
    this.ready$.complete()
  }
}
