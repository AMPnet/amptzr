import {MumbaiNetwork, Network} from './networks'

export const Hostnames: { [host in string]: Host } = {
  'woz.eugen.work': {
    network: MumbaiNetwork,
    issuerAddress: '0x521B0200138CeF507769F6d8E8d4999F60B6b319',
  },
}

export function getClientByHostname(): Host | undefined {
  return Hostnames[(window as any).location.hostname]
}

interface Host {
  network: Network
  issuerAddress: string
}
