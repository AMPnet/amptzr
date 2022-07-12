import { Pipe, PipeTransform } from '@angular/core'
import { PreferenceQuery } from '../../preference/state/preference.query'
import { environment } from '../../../environments/environment'

@Pipe({
  name: 'issuerPath',
})
export class IssuerPathPipe implements PipeTransform {
  constructor(private preferenceQuery: PreferenceQuery) {}

  public transform(value: any, opts?: Partial<Opts>): any {
    let path: string
    if (value === null || value === undefined) {
      return ''
    }

    path = Array.isArray(value) ? value.join('/') : String(value)

    if (path.startsWith('/')) {
      const identifier = this.preferenceQuery.issuer.slug
      if (identifier && !environment.fixed.issuer && !opts?.ignoreIssuer) {
        path = `/${identifier}`.concat(path)
      }

      if (!environment.fixed.chainID) {
        path = `/${this.preferenceQuery.network.chainID}`.concat(path)
      }
    }

    return path
  }
}

interface Opts {
  ignoreIssuer: boolean
}
