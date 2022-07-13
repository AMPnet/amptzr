import { cid, IPFSDocument, version } from './common'
import { iso8601, url } from '../common'

/**
 * Campaign interface is the agreed format of the content behind an IPFS hash
 * stored in Campaign contract on the blockchain.
 */
export interface IPFSCampaign {
  version: version

  name: string
  photo: url | cid
  /**
   Short description about the campaign. It is usually represented by a short explanation in
   a textual format (<280 characters).
   */
  about: string
  /**
   Long description that describes the entire project. It is usually represented by
   inline HTML content (WYSIWYG) in textual format.
   */
  description: string | cid
  startDate: iso8601
  endDate: iso8601
  return: {
    frequency?: ReturnFrequency
    from?: number
    to?: number
  }
  documents: IPFSDocument[]
  newsURLs: url[]
}

export enum ReturnFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi-annual',
  ANNUALLY = 'annual',
}
