/**
 * Campaign interface is the agreed format of the content behind an IPFS hash
 * stored in Campaign contract on the blockchain.
 */
export interface IPFSCampaign {
  version: number

  name: string
  logo: url | cid
  /*
  Short description about the campaign. It is usually represented by a short explanation in
  a textual format (<280 characters).
   */
  about: string
  /*
  Long description that describes the entire project. It is usually represented by
  inline HTML content (WYSIWYG) in textual format.
   */
  description: string | cid
  startDate: Date
  endDate: Date
  return: {
    from?: number,
    to?: number,
  }
}

type url = string
type cid = string
