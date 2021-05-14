import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {SignerService} from '../../../services/signers/signer.service';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletConnectComponent implements OnInit {
  constructor(private web3: SignerService) {
  }

  ngOnInit(): void {
  }

  getAddress(): void {
    this.web3.getAddress().pipe(
      tap(address => console.log(address))
    ).subscribe();
  }

  signMessage(message: string): void {
    this.web3.signMessage(message).pipe(
      tap(signed => console.log('signed message', signed)),
    ).subscribe();
  }
}
