import { Pipe, PipeTransform } from '@angular/core'
import { PreferenceQuery } from '../../preference/state/preference.query'

@Pipe({
  name: 'assetPathSegment',
})
export class AssetPathSegmentPipe implements PipeTransform {
  constructor(private preferenceQuery: PreferenceQuery) {}

  public transform(value: any): any {
    switch (value) {
      case this.preferenceQuery.network.tokenizerConfig.assetFactory.basic:
        return 'assets'
      case this.preferenceQuery.network.tokenizerConfig.assetFactory
        .transferable:
        return 'ft_assets'
    }

    return 'assets'
  }
}
