import { AsyncSubject, firstValueFrom } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Service, inject } from '@angular/core'
import { User } from '../../api'


@Service()
export class LoginService {
  user: User | null
  ready$ = new AsyncSubject<void>()

  private readonly http = inject(HttpClient)

  constructor () {
    this.init()
  }

  async updateUser (): Promise<void> {
    if (!this.user) {
      return
    }
    await firstValueFrom(this.http.put('/api/1/user', this.user))
  }

  private async init () {
    try {
      this.user = await firstValueFrom(this.http.get<User>('/api/1/user'))
    } catch {
      this.user = null
    }

    this.ready$.next()
    this.ready$.complete()
  }
}
