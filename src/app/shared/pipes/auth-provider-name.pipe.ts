import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {AuthProvider} from "../../preference/state/preference.store"

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'authProviderName',
})
export class AuthProviderNamePipe implements PipeTransform {
  constructor() {
  }

  transform(value: '' | AuthProvider | null | undefined): string {
    if (!value) {
      return ''
    }

    switch (value as AuthProvider) {
      case AuthProvider.METAMASK:
        return 'Metamask'
      case AuthProvider.WALLET_CONNECT:
        return 'Wallet Connect'
      case AuthProvider.VENLY:
        return 'Venly'
      default:
        throw new Error("Unknown auth provider")
    }
  }
}
