import {BaseContract, providers} from 'ethers'
import {EventFragment} from '@ethersproject/abi'
import {fromEventPattern, Observable, of} from 'rxjs'
import {TypedEvent, TypedEventFilter, TypedListener} from '../../../../types/ethers-contracts/common'

export function findLog(
  receipt: providers.TransactionReceipt,
  contract: BaseContract,
  event: EventFragment,
) {
  return receipt.logs
    .map(log => {
      try {
        return contract.interface.parseLog(log)
      } catch (_e) {
        return undefined
      }
    })
    .find(log => log?.name === event.name)
}

export function contractEvent<T1 extends Array<any>, T2>(
  contract: BaseContract, eventFilter: TypedEventFilter<TypedEvent<T1, T2>>,
): Observable<TypedListener<TypedEvent<T1, T2>>> {
  return fromEventPattern(
    handler => contract.on(eventFilter, handler),
    handler => contract.off(eventFilter, handler),
  )
}

export function resolveAddress(
  id: string, resolveByName$: Observable<string>,
): Observable<string> {
  if (id.startsWith('0x')) {
    return of(id)
  } else {
    return resolveByName$
  }
}
