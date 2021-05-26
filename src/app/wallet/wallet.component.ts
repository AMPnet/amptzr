import {ChangeDetectionStrategy, Component, ɵmarkDirty} from '@angular/core';
import {SessionQuery} from '../session/state/session.query';
import {SignerService} from '../shared/services/signer.service';
import {ethers} from 'ethers';
import {catchError, concatMap, map, retry, take, tap, timeout} from 'rxjs/operators';
import {from, Observable} from 'rxjs';
import {DialogService} from '../shared/services/dialog.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$;

  gas$ = this.sessionQuery.provider$.pipe(
    concatMap(provider => from(provider.getGasPrice()).pipe(
      timeout(3000),
      catchError(() => retry())
    )),
    map(gasRaw => ethers.utils.formatEther(gasRaw)),
  );

  blockNumber$ = this.sessionQuery.provider$.pipe(
    concatMap(provider => from(provider.getBlockNumber()).pipe(
      timeout(3000),
      catchError(() => retry())
    )),
  );

  address$ = this.sessionQuery.address$.pipe(
    tap(() => ɵmarkDirty(this))
  );

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService,
              private dialogService: DialogService) {
  }

  logout(): void {
    this.signerService.logout();
  }

  showCurrentGasPrice(): Observable<any> {
    return this.sessionQuery.provider$.pipe(
      take(1),
      concatMap(provider => from(provider.getGasPrice()).pipe(
        timeout(3000),
      )),
      map(gasRaw => ethers.utils.formatEther(gasRaw)),
      concatMap(gasPrice =>
        this.dialogService.info(`Current gas price is ${gasPrice}`, false))
    );
  }
}
