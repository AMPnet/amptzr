/**
 * Campaign interface is the agreed format of the content behind an IPFS hash
 * stored in Campaign contract on the blockchain.
 */
export interface IPFSCampaign {
  version: number

  name: string
  photo: url | cid
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
  startDate: iso8601
  endDate: iso8601
  return: {
    frequency?: ReturnFrequency,
    from?: number,
    to?: number,
  }
  documents: IPFSDocument[]
  newsURLs: string[]
}

type url = string
type cid = string
type iso8601 = string

export interface IPFSDocument {
  name: string,
  location: string | cid
}

// Since enums are not supported in .d.ts files, this is a hack to give ourselves a list of enum values as well as the
// type union of all its values
export type ReturnFrequencies = readonly ['monthly', 'quarterly', 'semi-annual', 'annual']
export type ReturnFrequency = ReturnFrequencies[number]
