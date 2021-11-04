import {Injectable, NgZone} from '@angular/core'
import {providers, utils} from 'ethers'
import {defer, from, fromEvent, merge, Observable, of, Subject, throwError} from 'rxjs'
import {catchError, concatMap, finalize, map, switchMap, take, tap} from 'rxjs/operators'
import {SessionStore} from '../../session/state/session.store'
import {SessionQuery} from '../../session/state/session.query'
import {DialogService} from './dialog.service'
import {PreferenceStore} from '../../preference/state/preference.store'
import {MetamaskSubsignerService, Subsigner} from './subsigners/metamask-subsigner.service'
import {MatDialog} from '@angular/material/dialog'
import {AuthComponent} from '../../auth/auth.component'
import {RouterService} from './router.service'
import {ErrorService} from './error.service'

@Injectable({
  providedIn: 'root',
})
export class SignerService {
  private subsigner: Subsigner = this.metamaskSubsignerService
  private accountsChangedSub = new Subject<string[]>()
  private chainChangedSub = new Subject<string>()
  private disconnectedSub = new Subject<void>()

  accountsChanged$ = this.accountsChangedSub.asObservable()
  chainChanged$ = this.chainChangedSub.asObservable()
  disconnected$ = this.disconnectedSub.asObservable()
  provider$ = this.sessionQuery.provider$

  private listenersSub = new Subject<any>()

  listeners$ = this.listenersSub.asObservable().pipe(
    switchMap(provider => merge(
      fromEvent<string[]>(provider, 'accountsChanged').pipe(
        map(accounts => () => this.accountsChangedSub.next(accounts)),
      ),
      fromEvent<string>(provider, 'chainChanged').pipe(
        map(chainID => () => this.chainChangedSub.next(chainID)),
      ),
      fromEvent<void>(provider, 'disconnect').pipe(
        map(() => () => this.disconnectedSub.next()),
      ),
    )),
    tap(action => this.ngZone.run(() => action())),
  )

  constructor(private sessionStore: SessionStore,
              private sessionQuery: SessionQuery,
              private preferenceStore: PreferenceStore,
              private metamaskSubsignerService: MetamaskSubsignerService,
              private ngZone: NgZone,
              private router: RouterService,
              private dialog: MatDialog,
              private errorService: ErrorService,
              private dialogService: DialogService) {
    this.subscribeToChanges()
  }

  private setSigner(signer: providers.JsonRpcSigner): void {
    this.sessionStore.update({
      address: this.preferenceStore.getValue().address,
      authProvider: this.preferenceStore.getValue().authProvider,
      signer,
    })
    this.registerListeners()
  }

  get ensureAuth(): Observable<providers.JsonRpcSigner> {
    return of(this.sessionQuery.signer).pipe(
      concatMap(signer => signer ?
        from(signer.getAddress()).pipe(map(() => signer!)) :
        this.loginDialog.pipe(
          map(() => this.sessionQuery.signer!),
        ),
      ),
    )
  }

  private get loginDialog() {
    return this.dialog.open(AuthComponent).afterClosed().pipe(
      concatMap(authCompleted => authCompleted ?
        this.sessionQuery.waitUntilLoggedIn() :
        throwError('LOGIN_MODAL_DISMISSED')),
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
      }),
    )
  }

  getAddress(): Observable<string> {
    return this.ensureAuth.pipe(
      switchMap(signer => from(signer.getAddress())),
    )
  }

  signMessage(message: string | utils.Bytes): Observable<string> {
    return this.ensureAuth.pipe(
      switchMap(signer => this.dialogService.withPermission(defer(() => {
        return from(signer.signMessage(message)).pipe(
          this.errorService.handleError(),
        )
      }))),
    )
  }

  sendTransaction(transaction: providers.TransactionRequest):
    Observable<providers.TransactionResponse> {
    return this.ensureAuth.pipe(
      switchMap(signer => this.dialogService.withPermission(defer(() => {
        return from(signer.sendTransaction(transaction)).pipe(
          this.errorService.handleError(),
        )
      }))),
    )
  }

  registerListeners(): void {
    this.listenersSub.next((this.sessionQuery.signer?.provider as any)?.provider)
  }

  private subscribeToChanges(): void {
    this.accountsChanged$.pipe(
      concatMap((accounts) => accounts.length === 0 ? this.logoutNavToOffers() : of(accounts)),
      concatMap(() => this.sessionQuery.signer?.getAddress() || of('')),
      tap(account => {
        if (account) {
          this.sessionStore.update({address: account})
          this.preferenceStore.update({address: account})
        }
      }),
    ).subscribe()

    this.chainChanged$.pipe(
      concatMap(chainID => this.provider$.pipe(take(1),
        concatMap(provider => provider.getNetwork()),
        concatMap(network => utils.hexValue(network.chainId) === chainID ?
          of(network) : this.logoutNavToOffers())),
      ),
      // provider.getNetwork() sometimes throws error on network mismatch.
      catchError(() => this.logoutNavToOffers()),
    ).subscribe()

    this.disconnected$.pipe(
      tap(() =>
        this.logoutNavToOffers().subscribe(),
      ),
    ).subscribe()

    this.listeners$.subscribe()
  }

  private logoutNavToOffers(): Observable<unknown> {
    return of(this.sessionQuery.isLoggedIn()).pipe(
      concatMap(isLoggedIn => isLoggedIn ? this.logout() : of(isLoggedIn)),
      concatMap(() => this.ngZone.run(() => this.router.navigate(['/offers']))),
    )
  }
}

interface LoginOpts {
  wallet?: string;
  force?: boolean;
}
