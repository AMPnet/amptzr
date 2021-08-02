import {ChangeDetectionStrategy, Component} from '@angular/core'
import {combineLatest, Observable, Subject} from 'rxjs'
import {concatMap, switchMap, tap} from 'rxjs/operators'
import {withStatus} from '../../utils/observables'
import {SignerService} from '../../services/signer.service'
import {utils} from 'ethers'
import {DialogService} from '../../services/dialog.service'
import {IdentityService} from '../../../identity/identity.service'
import {ProfileService} from '../../../profile/profile.service'
import {TokenMappingService} from '../../services/token-mapping.service'
import {SessionQuery} from '../../../session/state/session.query'
import {HttpClient} from '@angular/common/http'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {IpfsService} from '../../services/ipfs/ipfs.service'
import {IPFSIssuer} from '../../../../../types/ipfs/issuer'
import {IPFSAddResult} from '../../services/ipfs/ipfs.service.types'

@Component({
  selector: 'app-dev-playground',
  templateUrl: './dev-playground.component.html',
  styleUrls: ['./dev-playground.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPlaygroundComponent {
  contentSub = new Subject<IPFSAddResult>()
  investForm: FormGroup
  uploadForm: FormGroup

  constructor(private ipfsService: IpfsService,
              private signerService: SignerService,
              private identityService: IdentityService,
              private profileService: ProfileService,
              private tokenMappingService: TokenMappingService,
              private sessionQuery: SessionQuery,
              private http: HttpClient,
              private fb: FormBuilder,
              private dialogService: DialogService) {
    this.investForm = this.fb.group({
      amount: [0, Validators.required],
    })

    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      logo: [null, Validators.required],
    })
  }

  upload(): Observable<unknown> {
    return combineLatest([
      this.ipfsService.addFile(this.uploadForm.get('logo')!.value[0]),
    ]).pipe(
      switchMap(([logo]) => this.ipfsService.addObject<IPFSIssuer>({
        name: this.uploadForm.get('name')!.value,
        logo: logo.path,
      })),
      tap(res => {
        console.log(res)
        this.contentSub.next(res)
      }),
    )
  }

  content$ = this.contentSub.asObservable().pipe(
    switchMap(contentPath => withStatus(this.ipfsService.get<IPFSIssuer>(contentPath.path))),
  )

  signMessage(): Observable<unknown> {
    const message = 'YOLO'
    return this.signerService.signMessage(message).pipe(
      concatMap(signed => this.dialogService.info(
        `The address of the author that signed the message: ${utils.verifyMessage(message, signed)}`, false,
      )),
    )
  }

  // Used as a proof of concept for fetching transactions as usual provider methods are not
  // so suitable for our use-case.
  //
  // filter(): Observable<unknown> {
  //   return this.signerService.ensureAuth.pipe(
  //     map(signer => USDC__factory.connect(this.tokenMappingService.usdc, signer)),
  //     map(usdc => usdc.filters.Transfer(null, this.sessionQuery.getValue().address!)),
  //     map(usdc => {
  //       const params: { [key: string]: any } = {
  //         module: 'logs',
  //         action: 'getLogs',
  //         fromBlock: 0,
  //         toBlock: 'latest',
  //         address: usdc.address!,
  //       }
  //
  //       usdc.topics?.forEach((topic, index) => {
  //         if (topic) params[`topic${index}`] = topic
  //       })
  //
  //       return params
  //     }),
  //     switchMap(params => this.http.get('https://api-testnet.polygonscan.com/api', {
  //       params,
  //     })),
  //     tap(logs => console.log('logs', logs)),
  //   )
  // }

  checkInvest() {
    return this.signerService.ensureAuth.pipe(
      switchMap(() => this.identityService.ensureIdentityChecked),
      switchMap(() => this.profileService.ensureBasicInfo),
      switchMap(() => this.dialogService.info('You have passed all requirements for investing.', false)),
    )
  }

  // TODO: transaction examples. clean when it will be used elsewhere.
  // sendUSDC(to: string, amount: string) {
  //   return () => {
  //     return this.signerService.ensureAuth.pipe(
  //       map(signer => USDC__factory.connect(this.tokenMappingService.usdc, signer)),
  //       concatMap(usdc => from(usdc.transfer(to, utils.parseEther(amount))).pipe(
  //         tap(tx => console.log('transaction broadcasted: ', tx)),
  //         concatMap(tx => from(this.sessionQuery.provider.waitForTransaction(tx.hash, 3))),
  //         tap(receipt => console.log('receipt: ', receipt)),
  //         catchError(err => {
  //           console.log('error on sending usdc: ', err.code, err.reason, err)
  //           return EMPTY
  //         }),
  //       )),
  //     )
  //   }
  // }
  //
  // sendMATIC(to: string, amount: string) {
  //   return () => {
  //     return this.signerService.ensureAuth.pipe(
  //       concatMap(signer => from(signer.sendTransaction({
  //         to: to,
  //         value: utils.parseEther(amount),
  //         gasLimit: utils.hexlify('0x100000'), // 100000
  //       }))),
  //       tap(tx => console.log('transaction broadcasted: ', tx)),
  //       concatMap(tx => from(this.sessionQuery.provider.waitForTransaction(tx.hash, 3))),
  //       tap(receipt => console.log('receipt: ', receipt)),
  //       catchError(err => {
  //         console.log('error on send transaction: ', err.code)
  //         return EMPTY
  //       }),
  //     )
  //   }
  // }
}
