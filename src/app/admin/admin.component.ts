import {ChangeDetectionStrategy, Component} from '@angular/core'
import {IssuerService, IssuerWithInfo} from '../shared/services/blockchain/issuer.service'
import {Observable} from 'rxjs'
import {StablecoinService} from '../shared/services/blockchain/stablecoin.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent {
  issuer$: Observable<IssuerWithInfo>
  stableCoinSymbol: string

  constructor(private issuerService: IssuerService,
              private stableCoinService: StablecoinService) {
    this.issuer$ = this.issuerService.issuer$
    this.stableCoinSymbol = this.stableCoinService.symbol
  }
}
