import {Injectable} from '@angular/core'
import {SignerService} from './signer.service'
import {switchMap} from 'rxjs/operators'
import {BackendHttpClient} from './backend/backend-http-client.service'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private signerService: SignerService,
              private http: BackendHttpClient) {
  }

  logout() {
    return this.signerService.logout().pipe(
      switchMap(() => this.http.logout()),
    )
  }
}
