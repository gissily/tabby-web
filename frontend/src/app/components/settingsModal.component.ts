import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { User } from 'src/api'
import { CommonService, LoginService } from 'src/common'
import { AppConnectorService } from '../services/appConnector.service'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ClipboardModule, FaIconComponent],
  templateUrl: './settingsModal.component.html',
})
export class SettingsModalComponent {
  user = signal<User | null>(null)
  customGatewayEnabled = signal(false)
  _githubIcon = faGithub
  _copyIcon = faCopy
  _okIcon = faCheck

  constructor (
    public appConnector: AppConnectorService,
    public commonService: CommonService,
    private modalInstance: NgbActiveModal,
    private loginService: LoginService,
  ) {
    if (!loginService.user) {
      return
    }
    this.user.set({ ...loginService.user })
    this.customGatewayEnabled.set(!!this.user().custom_connection_gateway)
  }

  setGatewayField (field: 'custom_connection_gateway' | 'custom_connection_gateway_token', value: string): void {
    const user = this.user()
    if (user) {
      if (field === 'custom_connection_gateway') {
        user.custom_connection_gateway = value
      } else {
        user.custom_connection_gateway_token = value
      }
    }
  }

  async apply () {
    const user = this.user()
    if (user && this.loginService.user) {
      Object.assign(this.loginService.user, user)
      this.modalInstance.close()
      await this.loginService.updateUser()
    }
  }

  cancel () {
    this.modalInstance.dismiss()
  }
}
