import {ChangeDetectionStrategy, Component, NgZone, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
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
              private ngZone: NgZone,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  walletConnect(): void {
    this.ngZone.run(() => {
      this.router.navigate(['wallet']);
    });
  }
}
