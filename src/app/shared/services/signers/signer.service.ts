import {Injectable} from '@angular/core';
import {ethers} from 'ethers';
import {EMPTY, from, Observable, of, Subject, throwError} from 'rxjs';
import {catchError, concatMap, map, switchMap, tap} from 'rxjs/operators';
import {SessionStore, WalletProvider} from '../../../session/state/session.store';
import {SessionQuery} from '../../../session/state/session.query';

@Injectable({
  providedIn: 'root'
})
export class SignerService {
  private signer: ethers.providers.JsonRpcSigner | null = null;

  accountsChangedSub = new Subject<string[]>();
  disconnectedSub = new Subject<void>();

  accountsChanged$ = this.accountsChangedSub.asObservable();
  disconnected$ = this.disconnectedSub.asObservable();

  constructor(private sessionStore: SessionStore,
              private sessionQuery: SessionQuery) {
    this.accountsChanged$.pipe(
      tap(accounts => this.sessionStore.update({address: accounts[0], providerType: WalletProvider.METAMASK}))
    ).subscribe();

    this.disconnected$.pipe(tap(() => this.logout())).subscribe();
  }

  private setSigner(value: ethers.providers.JsonRpcSigner | null): void {
    this.signer = value;
    this.registerListeners();
  }

  initSigner(): Observable<unknown> {
    const session = this.sessionQuery.getValue();
    if (session.address !== '' && session.providerType === WalletProvider.METAMASK) {
      return this.login({force: false}).pipe(
        catchError(() => {
          this.logout();
          return EMPTY;
        }),
      );
    }

    return EMPTY;
  }

  private get ensureAuth(): Observable<ethers.providers.JsonRpcSigner> {
    return of(this.signer).pipe(
      concatMap(signer => signer?.provider?.listAccounts() ? of(signer) : this.login())
    );
  }

  private login(opts = {force: true}): Observable<ethers.providers.JsonRpcSigner> {
    return of((window as any)?.ethereum).pipe(
      concatMap(web3Provider => web3Provider ?
        of(new ethers.providers.Web3Provider(web3Provider)) : throwError('NO_METAMASK')),
      concatMap(provider => this.listAccounts(provider, opts.force).pipe(
        concatMap(accounts => accounts.length > 0 ? of(accounts[0]) : throwError('NO_ACCOUNTS')),
        tap(account => this.sessionStore.update({address: account, providerType: WalletProvider.METAMASK})),
        map(() => provider))
      ),
      map(provider => provider.getSigner()),
      tap(signer => this.setSigner(signer)),
    );
  }

  private listAccounts(provider: ethers.providers.Web3Provider, force: boolean): Observable<string[]> {
    return from(provider.listAccounts()).pipe(
      concatMap(accounts => accounts.length > 0 ?
        of(accounts) : force ? from(provider.send('eth_requestAccounts', [])) : throwError('NO_ACCOUNTS'))
    );
  }

  logout(): void {
    this.sessionStore.update({address: '', providerType: ''});
    this.signer = null;
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
    (this.signer?.provider as any)?.provider.on('accountsChanged', (accounts: string[]) => {
      this.accountsChangedSub.next(accounts);
    });

    (this.signer?.provider as any)?.provider.on('disconnect', () => {
      this.disconnectedSub.next();
    });
  }
}

