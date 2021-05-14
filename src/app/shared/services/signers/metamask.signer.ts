import {ethers} from 'ethers';

export class MetamaskSigner extends ethers.providers.JsonRpcSigner {
  connect(provider: ethers.providers.Provider): ethers.providers.JsonRpcSigner {
    return super.connect(provider);
  }
}
