import { MaticNetwork, MumbaiNetwork, Network } from './networks'
import { getWindow } from './utils/browser'

export const Hostnames: { [host in string]: Host } = {
  'tokenapp.biznisport.com': {
    network: MaticNetwork,
    issuerAddress: '0x950c8472c5bb8a10e111646a3de7fd226306b5cf',
  },
  'token.wespa-spaces.hr': {
    network: MaticNetwork,
    issuerAddress: '0x9950c5290eddea0cf5ff6195fd8b38a22452703b',
  },
  'token.tokenizedrenewables.io': {
    network: MaticNetwork,
    issuerAddress: '0xa6fd19e6f65d4055ac8590758088c37adb7a504f',
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
