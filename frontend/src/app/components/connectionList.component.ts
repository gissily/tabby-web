import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { AppConnectorService, SocketProxy } from '../services/appConnector.service'
import { faCircle, faXmark } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'connection-list',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './connectionList.component.html',
})
export class ConnectionListComponent {
  _circleIcon = faCircle
  _closeIcon = faXmark

  constructor (
    public appConnector: AppConnectorService,
  ) { }

  closeSocket (socket: SocketProxy) {
    socket.close(new Error('Connection closed by user'))
  }
}
