import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {SignerService} from '../../shared/services/signer.service';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletConnectComponent implements OnInit {
  constructor(private signer: SignerService) {
  }

  ngOnInit(): void {
  }

  connectMetamask(): Observable<unknown> {
    return this.signer.login();
  }

  connectWalletConnect(): Observable<unknown> {
    return EMPTY;
  }
}
