import { Injectable } from '@angular/core'
import { RouterService } from '../shared/services/router.service'
import { TransferParams } from './transfer.component'

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  constructor(private router: RouterService) {}

  navigate(tokenAddress: string, opts?: Options) {
    this.router.navigate(['/transfer'], {
      queryParams: {
        tokenAddress,
        ...opts,
      },
    })
  }
}

type Options = Omit<TransferParams, 'tokenAddress'>
