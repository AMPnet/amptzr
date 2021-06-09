import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {utils} from 'ethers'
import {catchError, concatMap, map, retry, startWith, switchMap, take, tap, timeout} from 'rxjs/operators'
import {combineLatest, EMPTY, from, interval, Observable} from 'rxjs'
import {DialogService} from '../shared/services/dialog.service'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$;

  gas$ = WalletComponent.withInterval(this.sessionQuery.provider$, 5000).pipe(
    concatMap(provider => from(provider.getGasPrice()).pipe(
      timeout(3000),
      catchError(() => retry())
    )),
    map(gasRaw => utils.formatEther(gasRaw)),
  );

  blockNumber$ = WalletComponent.withInterval(this.sessionQuery.provider$, 2000).pipe(
    switchMap(provider => from(provider.getBlockNumber()).pipe(
      timeout(1800),
      catchError(() => EMPTY),
    )),
  );

  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this))
  );

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private dialogService: DialogService) {
  }

  private static withInterval<T>(observable: Observable<T>, offset: number): Observable<T> {
    return combineLatest([
      observable, interval(offset).pipe(startWith(0)),
    ]).pipe(
      map(([result, _]) => result)
    )
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
        this.dialogService.info(`Current gas price is ${gasPrice}`, false))
    )
  }
}
