import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {EMPTY, from, Observable} from 'rxjs'
import {catchError, concatMap, map, tap} from 'rxjs/operators'
import {utils} from 'ethers'
import {DialogService} from '../shared/services/dialog.service'
import {USDC__factory} from '../../../types/ethers-contracts'
import {TokenMappingService} from '../shared/services/token-mapping.service'
import {environment} from '../../environments/environment'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  address$ = this.sessionQuery.address$

  constructor(private sessionQuery: SessionQuery,
              private tokenMappingService: TokenMappingService,
              private signerService: SignerService,
              private dialogService: DialogService) {
  }

  signMessage(): Observable<unknown> {
    const message = 'YOLO'
    return this.signerService.signMessage(message).pipe(
      concatMap(signed => this.dialogService.info(
        `The address of the author that signed the message: ${utils.verifyMessage(message, signed)}`, false,
      )),
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
