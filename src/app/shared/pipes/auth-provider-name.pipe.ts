import { Injectable, Pipe, PipeTransform } from '@angular/core'
import { AuthProvider } from '../../preference/state/preference.store'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'authProviderName',
})
export class AuthProviderNamePipe implements PipeTransform {
  constructor() {}

  transform(value: '' | AuthProvider | null | undefined): string {
    if (!value) {
      return ''
    }

    switch (value) {
      case AuthProvider.METAMASK:
        return 'Metamask'
      case AuthProvider.MAGIC:
        return 'Magic'
      case AuthProvider.WALLET_CONNECT:
        return 'WalletConnect'
      case AuthProvider.GNOSIS_SAFE:
        return 'Gnosis Safe'
    }
  }
}
