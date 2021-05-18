import {Injectable} from '@angular/core';
import {ethers} from 'ethers';
import {EMPTY, from, Observable, of, Subject, throwError} from 'rxjs';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {SessionStore} from '../../session/state/session.store';
import {SessionQuery} from '../../session/state/session.query';
import {DialogService} from './dialog.service';
import {Router} from '@angular/router';
import {PreferenceStore, WalletProvider} from '../../preference/state/preference.store';

@Injectable({
  providedIn: 'root'
})
export class SignerService {
  private accountsChangedSub = new Subject<string[]>();
  private disconnectedSub = new Subject<void>();

  accountsChanged$ = this.accountsChangedSub.asObservable();
  disconnected$ = this.disconnectedSub.asObservable();

  constructor(private sessionStore: SessionStore,
              private sessionQuery: SessionQuery,
              private preferenceStore: PreferenceStore,
              private router: Router,
              private dialogService: DialogService) {
    this.subscribeToChanges();
  }

  private setSigner(signer: ethers.providers.JsonRpcSigner): void {
    this.sessionStore.update({
      address: this.preferenceStore.getValue().address,
      signer
    });
    this.registerListeners();
  }

  private get ensureAuth(): Observable<ethers.providers.JsonRpcSigner> {
    return of(this.sessionQuery.signer).pipe(
      concatMap(signer => signer ?
        from(signer.getAddress()).pipe(map(() => signer)) :
        this.loginRequiredProcedure
      ),
      concatMap(signer => signer.getAddress() ?
        of(signer) : this.loginRequiredProcedure)
    );
  }

  private get loginRequiredProcedure(): Observable<any> {
    return this.dialogService.info('Login with your wallet to proceed').pipe(
      concatMap(confirm => confirm ? from(this.router.navigate(['/wallet'])) : EMPTY)
    );
  }

  login(opts: LoginOpts = {force: true}): Observable<ethers.providers.JsonRpcSigner> {
    return of((window as any)?.ethereum).pipe(
      concatMap(web3Provider => web3Provider ?
        of(new ethers.providers.Web3Provider(web3Provider).getSigner()) : throwError('NO_METAMASK')),
      concatMap(signer => this.loginGetAddress(signer, !!opts.force).pipe(
        concatMap(address => opts.wallet ? (
          opts.wallet === address ? of(address) : throwError('WRONG_ADDRESS')
        ) : of(address)),
        tap(address => this.preferenceStore.update({address, providerType: WalletProvider.METAMASK})),
        map(() => signer),
        )
      ),
      tap(signer => this.setSigner(signer)),
    );
  }

  private loginGetAddress(signer: ethers.providers.JsonRpcSigner, force: boolean): Observable<string> {
    return from(signer.getAddress()).pipe(
      catchError(() => force ? from(signer.provider.send('eth_requestAccounts', [])) : throwError('NO_ADDRESS')),
      concatMap(address => !!address ? of(address) : throwError('NO_ADDRESS')),
    );
  }

  logout(): void {
    this.preferenceStore.update({address: '', providerType: ''});
    this.sessionStore.reset();
  }

  getAddress(): Observable<string> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.getAddress())),
    );
  }

  signMessage(message: string): Observable<string> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.signMessage(message)))
    );
  }

  sendTransaction(transaction: ethers.providers.TransactionRequest):
    Observable<ethers.providers.TransactionResponse> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.sendTransaction(transaction)))
    );
  }

  registerListeners(): void {
    (this.sessionQuery.signer?.provider as any)?.provider.removeAllListeners(['accountsChanged']);
    (this.sessionQuery.signer?.provider as any)?.provider.on('accountsChanged', (accounts: string[]) => {
      this.accountsChangedSub.next(accounts);
    });

    (this.sessionQuery.signer?.provider as any)?.provider.removeAllListeners(['disconnect']);
    (this.sessionQuery.signer?.provider as any)?.provider.on('disconnect', () => {
      this.disconnectedSub.next();
    });
  }

  private subscribeToChanges(): void {
    this.accountsChanged$.pipe(
      concatMap(() => this.ensureAuth.pipe(concatMap(signer => signer.getAddress()))),
      tap(account => this.sessionStore.update({address: account}))
    ).subscribe();

    this.disconnected$.pipe(
      tap(() => {
        if (this.sessionQuery.isLoggedIn()) {
          this.logout();
        }
      })
    ).subscribe();
  }
}

interface LoginOpts {
  wallet?: string;
  force?: boolean;
}
