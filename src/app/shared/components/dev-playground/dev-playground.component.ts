import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable, Subject} from 'rxjs'
import {concatMap, switchMap, tap} from 'rxjs/operators'
import {withStatus} from '../../utils/observables'
import {IpfsService} from '../../services/ipfs.service'
import {SignerService} from '../../services/signer.service'
import {utils} from 'ethers'
import {DialogService} from '../../services/dialog.service'
import {IdentityService} from '../../../identity/identity.service'

@Component({
  selector: 'app-dev-playground',
  templateUrl: './dev-playground.component.html',
  styleUrls: ['./dev-playground.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPlaygroundComponent {
  contentSub = new Subject<string>()

  constructor(private ipfsService: IpfsService,
              private signerService: SignerService,
              private identityService: IdentityService,
              private dialogService: DialogService) {
  }

  upload(): Observable<unknown> {
    return this.ipfsService.addJSON({halo: 'theres'}).pipe(
      tap(res => {
        console.log(res)
        this.contentSub.next(res.path)
      }),
    )
  }

  content$ = this.contentSub.asObservable().pipe(
    switchMap(contentPath => withStatus(this.ipfsService.get(contentPath))),
  )

  signMessage(): Observable<unknown> {
    const message = 'YOLO'
    return this.signerService.signMessage(message).pipe(
      concatMap(signed => this.dialogService.info(
        `The address of the author that signed the message: ${utils.verifyMessage(message, signed)}`, false,
      )),
    )
  }

  checkInvest() {
    return this.signerService.ensureAuth.pipe(
      switchMap(() => this.identityService.ensureIdentityChecked),
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
