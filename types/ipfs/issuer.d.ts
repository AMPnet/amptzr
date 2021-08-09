/**
 * Issuer interface is the agreed format of the content behind an IPFS hash
 * stored in Issuer contract on the blockchain.
 */
export interface IPFSIssuer {
  version: number

  name: string
  logo: url | cid
}

type url = string
type cid = string
