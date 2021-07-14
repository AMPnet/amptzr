import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {utils} from 'ethers'
import {catchError, concatMap, map, switchMap, take, tap, timeout} from 'rxjs/operators'
import {combineLatest, EMPTY, from, Observable, of} from 'rxjs'
import {DialogService} from '../shared/services/dialog.service'
import {VenlySubsignerService} from '../shared/services/subsigners/venly-subsigner.service'
import {AuthProvider} from '../preference/state/preference.store'
import {withInterval, withStatus} from '../shared/utils/observables'
import {USDC__factory} from '../../../types/ethers-contracts'
import {TokenMappingService} from '../shared/services/token-mapping.service'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  authProvider = AuthProvider
  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  gas$ = this.sessionQuery.provider$.pipe(
    switchMap(provider => withStatus(
      withInterval(of(provider), 5000).pipe(
        concatMap(provider => from(provider.getGasPrice()).pipe(
          timeout(3000),
          catchError(() => EMPTY),
        )),
        map(gasRaw => utils.formatEther(gasRaw)),
      ))),
  )

  blockNumber$ = this.sessionQuery.provider$.pipe(
    switchMap(provider => withStatus(
      withInterval(of(provider), 2000).pipe(
        switchMap(provider => from(provider.getBlockNumber()).pipe(
          timeout(1800),
          catchError(() => EMPTY),
        )),
      ))),
  )

  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this)),
  )

  balanceUSDC$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
    switchMap(([provider, address]) => withStatus(
      of(USDC__factory.connect(this.tokenMappingService.usdc, provider)).pipe(
        concatMap(usdc => usdc.balanceOf(address!)),
        map(value => utils.formatEther(value)),
      ),
    )),
  )

  balanceMATIC$ = combineLatest([this.sessionQuery.provider$, this.sessionQuery.address$]).pipe(
    switchMap(([provider, address]) => withStatus(
      from(provider.getBalance(address!)).pipe(
        map(value => utils.formatEther(value)),
      ),
    )),
  )

  authProvider$ = this.sessionQuery.authProvider$

  constructor(private sessionQuery: SessionQuery,
              private tokenMappingService: TokenMappingService,
              private signerService: SignerService,
              private venly: VenlySubsignerService,
              private dialogService: DialogService) {
  }

  logout(): void {
    this.signerService.logout().subscribe()
  }

  showCurrentGasPrice(): Observable<any> {
    return this.sessionQuery.provider$.pipe(
      take(1),
      concatMap(provider => from(provider.getGasPrice()).pipe(
        timeout(3000),
      )),
      map(gasRaw => utils.formatEther(gasRaw)),
      concatMap(gasPrice =>
        this.dialogService.info(`Current gas price is ${gasPrice}`, false)),
    )
  }

  manageWallets() {
    return this.venly.manageWallets().pipe(
      concatMap(res => res ? this.signerService.login(this.venly, {force: false}) : EMPTY),
    )
  }
}
