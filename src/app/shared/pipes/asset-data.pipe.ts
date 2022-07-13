import { Injectable, Pipe, PipeTransform } from '@angular/core'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import {
  Erc20Service,
  ERC20TokenData,
} from '../services/blockchain/erc20.service'
import {
  AssetService,
  CommonAssetWithInfo,
} from '../services/blockchain/asset/asset.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'assetData',
})
export class AssetDataPipe implements PipeTransform {
  constructor(
    private erc20Service: Erc20Service,
    private assetService: AssetService
  ) {}

  transform(value: any, opt?: 'tokenOnly'): Observable<AssetData> {
    return combineLatest([
      value
        ? this.erc20Service.getData(value)
        : of({
            address: '0x0',
            name: 'Native Coin',
            decimals: 18,
            symbol: 'Native',
          }),
      opt === 'tokenOnly'
        ? of(undefined)
        : this.assetService
            .getAssetWithInfo(value, true)
            .pipe(catchError(() => of(undefined))),
    ]).pipe(map(([tokenData, asset]) => ({ tokenData, asset })))
  }
}

interface AssetData {
  tokenData: ERC20TokenData
  asset: CommonAssetWithInfo | undefined
}
