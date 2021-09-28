import {MaticNetwork, MumbaiNetwork, Network} from './networks'
import {getWindow} from './utils/browser'

export const Hostnames: { [host in string]: Host } = {
  'token.mining4mining.io': {
    network: MaticNetwork,
    issuerAddress: '0xA240868AF33f6E44d85654bBE1CA73B9b9eA7C3d',
  },
  'woz.eugen.work': {
    network: MumbaiNetwork,
    issuerAddress: '0x75C7193E8e0C8179A0cb2FF190Bc8E4681ffA8c7',
  },
}

export function getClientByHostname(): Host | undefined {
  return Hostnames[getWindow()?.location?.hostname]
}

interface Host {
  network: Network
  issuerAddress: string
}
