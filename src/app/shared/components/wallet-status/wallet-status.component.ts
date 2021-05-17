import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {SignerService} from '../../services/signer.service';
import {SessionQuery} from '../../../session/state/session.query';

@Component({
  selector: 'app-wallet-status',
  templateUrl: './wallet-status.component.html',
  styleUrls: ['./wallet-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletStatusComponent implements OnInit {
  loggedIn$ = this.sessionQuery.isLoggedIn$;

  constructor(private dialog: MatDialog,
              private sessionQuery: SessionQuery,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  walletConnect(): Promise<boolean> {
    // TODO: example of opening the dialog
    // this.dialog.open(WalletConnectComponent, {
    //   hasBackdrop: true
    // });

    return this.router.navigate(['wallet']);
  }
}
