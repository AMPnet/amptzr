export type cid = string

/**
 * version is a decimal number that tracks changes of the IPFS interface data.
 * A change in decimal number marks a minor non-breaking change (e.g. 1.24 -> 1.25).
 * A change in whole number marks a breaking change (e.g. 1.4 -> 2.0).
 */
export type version = number

export interface IPFSDocument {
  name: string
  location: string | cid
}
