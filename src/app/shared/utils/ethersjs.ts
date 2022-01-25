import {BaseContract, BigNumber, constants, providers} from 'ethers'
import {EventFragment} from '@ethersproject/abi'
import {fromEventPattern, Observable, of} from 'rxjs'
import {TypedEvent, TypedEventFilter} from '../../../../types/ethers-contracts/common'

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

export function contractEvent<T1 extends Array<any>, T2, E extends (...args: any) => TypedEvent<T1, T2>>(
  contract: BaseContract, eventFilter: TypedEventFilter<TypedEvent<T1, T2>>,
): Observable<ReturnType<E>> {
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

export function BigNumberMin(...values: BigNumber[]): BigNumber {
  let lowest = constants.MaxUint256
  for (const i in values) {
    if (values[i].lt(lowest)) lowest = values[i]
  }

  return lowest
}

export function BigNumberMax(...values: BigNumber[]): BigNumber {
  let highest = constants.MinInt256
  for (const i in values) {
    if (values[i].gt(highest)) highest = values[i]
  }

  return highest
}

export function extract<T>(target: T): T {
  const result = {} as T
  for (const property of Object.keys(target) as Array<keyof T>) {
    if (!isNaN(property as number)) continue

    result[property] = target[property]
  }

  return result
}
