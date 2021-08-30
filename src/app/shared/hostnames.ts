import {MumbaiNetwork, Network} from './networks'

export const Hostnames: { [host in string]: Host } = {
  'woz.eugen.work': {
    network: MumbaiNetwork,
    issuerAddress: '0xc95fcFd88C1D0b491E2F1A367a0211c6c6F35dF0',
  },
}

export function getClientByHostname(): Host | undefined {
  return Hostnames[(window as any).location.hostname]
}

interface Host {
  network: Network
  issuerAddress: string
}
