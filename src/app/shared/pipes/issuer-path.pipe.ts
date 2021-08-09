import {Pipe, PipeTransform} from '@angular/core'
import {PreferenceQuery} from '../../preference/state/preference.query'

@Pipe({
  name: 'issuerPath',
})
export class IssuerPathPipe implements PipeTransform {
  constructor(private preferenceQuery: PreferenceQuery) {
  }

  public transform(value: any): any {
    let path: string
    if (value === null || value === undefined) {
      return ''
    }

    path = Array.isArray(value) ? value.join('/') : String(value)

    if (path.startsWith('/')) {
      const identifier = this.preferenceQuery.issuer.slug

      if (identifier) {
        path = `/${identifier}${path}`
      }
    }

    return path
  }
}
