/**
 * Asset interface is the agreed format of the content behind an IPFS hash
 * stored in Asset contract on the blockchain.
 */
export interface IPFSAsset {
  version: number

  name: string
  logo: url | cid
}

type url = string
type cid = string
