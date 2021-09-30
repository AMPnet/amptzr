import {MaticNetwork, MumbaiNetwork, Network} from './networks'
import {getWindow} from './utils/browser'

export const Hostnames: { [host in string]: Host } = {
  'token.wespa-spaces.hr': {
    network: MaticNetwork,
    issuerAddress: '0x9950c5290eddea0cf5ff6195fd8b38a22452703b',
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
