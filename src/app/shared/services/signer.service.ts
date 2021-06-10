import {Injectable, NgZone} from '@angular/core'
import {providers, utils} from 'ethers'
import {EMPTY, from, Observable, of, Subject} from 'rxjs'
import {catchError, concatMap, finalize, map, switchMap, take, tap} from 'rxjs/operators'
import {SessionStore} from '../../session/state/session.store'
import {SessionQuery} from '../../session/state/session.query'
import {DialogService} from './dialog.service'
import {Router} from '@angular/router'
import {PreferenceStore} from '../../preference/state/preference.store'
import {MetamaskSubsignerService, Subsigner} from './subsigners/metamask-subsigner.service'

@Injectable({
  providedIn: 'root'
})
export class SignerService {
  private subsigner: Subsigner = this.metamaskSubsignerService;
  private accountsChangedSub = new Subject<string[]>();
  private chainChangedSub = new Subject<string>();
  private disconnectedSub = new Subject<void>();

  accountsChanged$ = this.accountsChangedSub.asObservable();
  chainChanged$ = this.chainChangedSub.asObservable();
  disconnected$ = this.disconnectedSub.asObservable();
  provider$ = this.sessionQuery.provider$;

  constructor(private sessionStore: SessionStore,
              private sessionQuery: SessionQuery,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private ngZone: NgZone,
              private router: Router,
              private dialogService: DialogService) {
    this.subscribeToChanges()
  }

  private setSigner(signer: providers.JsonRpcSigner): void {
    this.sessionStore.update({
      address: this.preferenceStore.getValue().address,
      authProvider: this.preferenceStore.getValue().authProvider,
      signer
    })
    this.registerListeners()
  }

  private get ensureAuth(): Observable<providers.JsonRpcSigner> {
    return of(this.sessionQuery.signer).pipe(
      concatMap(signer => signer ?
        from(signer.getAddress()).pipe(map(() => signer)) :
        this.loginRequiredProcedure
      ),
      concatMap(signer => signer.getAddress() ?
        of(signer) : this.loginRequiredProcedure)
    )
  }

  private get loginRequiredProcedure(): Observable<any> {
    return this.dialogService.info('Login with your wallet to proceed').pipe(
      concatMap(confirm => confirm ? from(this.router.navigate(['/wallet'])) : EMPTY)
    )
  }

  login<T extends Subsigner>(subsigner: T, opts: LoginOpts = {force: true}): Observable<providers.JsonRpcSigner> {
    this.subsigner = subsigner
    return this.subsigner.login(opts).pipe(
      tap(signer => this.setSigner(signer)),
    )
  }

  logout(): Observable<unknown> {
    return this.subsigner.logout().pipe(
      finalize(() => {
        this.preferenceStore.update({address: '', authProvider: ''})
        this.sessionStore.update({address: '', signer: undefined})
      })
    )
  }

  getAddress(): Observable<string> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.getAddress())),
    )
  }

  signMessage(message: string | utils.Bytes): Observable<string> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.signMessage(message)))
    )
  }

  sendTransaction(transaction: providers.TransactionRequest):
    Observable<providers.TransactionResponse> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.sendTransaction(transaction)))
    )
  }

  registerListeners(): void {
    (this.sessionQuery.signer?.provider as any)?.provider?.removeAllListeners(['accountsChanged']);
    (this.sessionQuery.signer?.provider as any)?.provider.on('accountsChanged', (accounts: string[]) => {
      this.accountsChangedSub.next(accounts)
    });

    (this.sessionQuery.signer?.provider as any)?.provider?.removeAllListeners(['chainChanged']);
    (this.sessionQuery.signer?.provider as any)?.provider.on('chainChanged', (chainID: string) => {
      this.chainChangedSub.next(chainID)
    });

    (this.sessionQuery.signer?.provider as any)?.provider?.removeAllListeners(['disconnect']);
    (this.sessionQuery.signer?.provider as any)?.provider.on('disconnect', () => {
      this.disconnectedSub.next()
    })
  }

  private subscribeToChanges(): void {
    this.accountsChanged$.pipe(
      concatMap((accounts) => accounts.length === 0 ? this.logoutNavToWallet() : of(accounts)),
      concatMap(() => this.sessionQuery.signer?.getAddress() || of('')),
      tap(account => account ? this.sessionStore.update({address: account}) : null)
    ).subscribe()

    this.chainChanged$.pipe(
      concatMap(chainID => this.provider$.pipe(take(1),
        concatMap(provider => provider.getNetwork()),
        concatMap(network => utils.hexValue(network.chainId) === chainID ?
          of(network) : this.logoutNavToWallet()))
      ),
      // provider.getNetwork() sometimes throws error on network mismatch.
      catchError(() => this.logoutNavToWallet())
    ).subscribe()

    this.disconnected$.pipe(
      tap(() =>
        this.logoutNavToWallet().subscribe()
      )
    ).subscribe()
  }

  private logoutNavToWallet(): Observable<unknown> {
    return of(this.sessionQuery.isLoggedIn()).pipe(
      concatMap(isLoggedIn => isLoggedIn ? this.logout() : of(isLoggedIn)),
      concatMap(() => this.ngZone.run(() => this.router.navigate(['/wallet'])))
    )
  }
}

interface LoginOpts {
  wallet?: string;
  force?: boolean;
}
