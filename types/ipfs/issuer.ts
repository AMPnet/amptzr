import { address, url } from '../common'
import { cid, version } from './common'

/**
 * Issuer interface is the agreed format of the content behind an IPFS hash
 * stored in Issuer contract on the blockchain.
 */
export interface IPFSIssuer {
  version: version

  name: string
  logo: url | cid

  rampApiKey: string
  magicLinkApiKey: string
  crispWebsiteId: string
  offersDisplaySettings?: cid
}

export interface IPFSOffersDisplaySettings {
  hiddenOffers: address[]
}
