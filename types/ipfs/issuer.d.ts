/**
 * Issuer interface is the agreed format of the content behind an IPFS hash
 * stored in Issuer contract on the blockchain.
 */
interface Issuer {
  name: string
  logo: url | cid
}

type url = string
type cid = string
