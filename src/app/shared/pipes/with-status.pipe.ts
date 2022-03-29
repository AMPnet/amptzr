import {Injectable, Pipe, PipeTransform} from '@angular/core'
import {combineLatest, Observable, of} from 'rxjs'
import {catchError, map} from 'rxjs/operators'
import {Erc20Service, ERC20TokenData} from '../services/blockchain/erc20.service'
import {AssetService, CommonAssetWithInfo} from '../services/blockchain/asset/asset.service'
import {withStatus, WithStatus} from '../utils/observables'

@Injectable({
  providedIn: 'root',
})
@Pipe({
  name: 'withStatus',
})
export class WithStatusPipe implements PipeTransform {
  constructor() {
  }

  transform<T>(value: Observable<T>): Observable<WithStatus<T>> {
    return withStatus(value)
  }
}
