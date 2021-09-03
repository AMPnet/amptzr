import {MaticNetwork, MumbaiNetwork, Network} from './networks'
import {getWindow} from './utils/browser'

export const Hostnames: { [host in string]: Host } = {
  'token.mining4mining.io': {
    network: MaticNetwork,
    issuerAddress: '0xA240868AF33f6E44d85654bBE1CA73B9b9eA7C3d',
  },
  'woz.eugen.work': {
    network: MumbaiNetwork,
    issuerAddress: '0xc95fcFd88C1D0b491E2F1A367a0211c6c6F35dF0',
  },
}

export function getClientByHostname(): Host | undefined {
  return Hostnames[getWindow()?.location?.hostname]
}

interface Host {
  network: Network
  issuerAddress: string
}
