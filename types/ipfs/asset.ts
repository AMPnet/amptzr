import { cid, version } from './common'
import { url } from '../common'

/**
 * Asset interface is the agreed format of the content behind an IPFS hash
 * stored in Asset contract on the blockchain.
 */
export interface IPFSAsset {
  version: version

  logo: url | cid
  description: string | cid
  documents: {
    name: string
    location: string | cid
  }[]
}
