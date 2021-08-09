import {BaseContract, providers} from 'ethers'
import {EventFragment} from '@ethersproject/abi'

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
