import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {BackendHttpClient} from './backend-http-client.service'

@Injectable({
  providedIn: 'root',
})
export class BackendUserService {
  path = `${environment.backendURL}/api/identity`

  constructor(private http: BackendHttpClient) {
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.path}/user`)
  }
}

interface User {
  address: string;
  email: string | null;
  email_verified: boolean;
  kyc_completed: boolean;
}
