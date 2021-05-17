import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {SessionQuery} from '../session/state/session.query';
import {SignerService} from '../shared/services/signer.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletComponent implements OnInit {
  isLoggedIn$ = this.sessionQuery.isLoggedIn$;

  constructor(private sessionQuery: SessionQuery,
              private signer: SignerService) {
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.signer.logout();
  }
}
