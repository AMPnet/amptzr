import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SessionQuery} from '../session/state/session.query';
import {SignerService} from '../shared/services/signer.service';
import {ethers} from 'ethers';
import {concatMap, map, take, tap, timeout} from 'rxjs/operators';
import {from} from 'rxjs';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$;

  constructor(private sessionQuery: SessionQuery,
              private signerService: SignerService) {
  }

  logout(): void {
    this.signerService.logout();
  }

  getSomethingFromBlockchain(): void {
    this.sessionQuery.provider$.pipe(
      take(1),
      concatMap(provider => from(provider.getGasPrice()).pipe(
        timeout(3000),
      )),
      map(gasRaw => ethers.utils.formatEther(gasRaw)),
      tap(gas => console.log('gas: ', gas)),
    ).subscribe();

    this.sessionQuery.provider$.pipe(
      take(1),
      concatMap(provider => from(provider.getNetwork()).pipe(
        timeout(3000),
      )),
      tap(res => console.log('network: ', res)),
    ).subscribe();
  }
}
