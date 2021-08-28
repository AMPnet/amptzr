import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-dev-playground',
  templateUrl: './dev-playground.component.html',
  styleUrls: ['./dev-playground.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPlaygroundComponent {
  constructor() {
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

  // TODO: transaction examples. clean when it will be used elsewhere.
  // sendUSDC(to: string, amount: string) {
  //   return () => {
  //     return this.signerService.ensureAuth.pipe(
  //       map(signer => USDC__factory.connect(this.tokenMappingService.usdc, signer)),
  //       concatMap(usdc => from(usdc.transfer(to, stablecoin.parse(amount))).pipe(
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
  //         value: stablecoin.parse(amount),
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
