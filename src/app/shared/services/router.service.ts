import { Injectable } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { IssuerPathPipe } from '../pipes/issuer-path.pipe'
import { environment } from '../../../environments/environment'
import { PreferenceQuery } from '../../preference/state/preference.query'

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  constructor(
    public router: Router,
    private preferenceQuery: PreferenceQuery,
    private issuerPathPipe: IssuerPathPipe
  ) {}

  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate(
      [this.issuerPathPipe.transform(commands)],
      extras
    )
  }

  navigateNetwork(
    commands: any[],
    extras?: NavigationExtras
  ): Promise<boolean> {
    return this.router.navigate(
      [this.issuerPathPipe.transform(commands, { ignoreIssuer: true })],
      extras
    )
  }

  constructURL(relativePath: string): string {
    return this.issuerPathPipe.transform([relativePath])
  }

  navigateIssuer(issuerName: string): Promise<boolean> {
    let path = ''

    if (!environment.fixed.chainID) {
      path = path.concat(`/${this.preferenceQuery.network.chainID}`)
    }

    if (!environment.fixed.issuer) {
      path = path.concat(`/${issuerName}`)
    }

    return this.router.navigate([path])
  }
}
