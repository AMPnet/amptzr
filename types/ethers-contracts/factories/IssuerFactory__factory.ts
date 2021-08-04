/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { IssuerFactory, IssuerFactoryInterface } from "../IssuerFactory";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "IssuerCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "stablecoin",
        type: "address",
      },
      {
        internalType: "address",
        name: "walletApprover",
        type: "address",
      },
      {
        internalType: "string",
        name: "info",
        type: "string",
      },
    ],
    name: "create",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getInstances",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "instances",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506118d4806100206000396000f3fe60806040523480156200001157600080fd5b5060043610620000465760003560e01c80636c8a6f55146200004b578063a2f7b3a5146200007a578063d35fdd791462000091575b600080fd5b620000626200005c3660046200024d565b620000aa565b60405162000071919062000349565b60405180910390f35b620000626200008b36600462000330565b62000193565b6200009b620001be565b6040516200007191906200037e565b600080600080549050905060008187878787604051620000ca9062000222565b620000da959493929190620003cd565b604051809103906000f080158015620000f7573d6000803e3d6000fd5b50600080546001810182559080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5630180546001600160a01b0319166001600160a01b03838116919091179091556040519192508816907f5aa6b1353324c0d8718f3a028ccb9ca03d21f4895d6d2ee526d6beac86c7b8459062000181908490869042906200035d565b60405180910390a29695505050505050565b60008181548110620001a457600080fd5b6000918252602090912001546001600160a01b0316905081565b606060008054806020026020016040519081016040528092919081815260200182805480156200021857602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311620001f9575b5050505050905090565b61143a806200046583390190565b80356001600160a01b03811681146200024857600080fd5b919050565b6000806000806080858703121562000263578384fd5b6200026e8562000230565b935060206200027f81870162000230565b93506200028f6040870162000230565b9250606086013567ffffffffffffffff80821115620002ac578384fd5b818801915088601f830112620002c0578384fd5b813581811115620002d557620002d56200044e565b604051601f8201601f1916810185018381118282101715620002fb57620002fb6200044e565b60405281815283820185018b101562000312578586fd5b81858501868301379081019093019390935250939692955090935050565b60006020828403121562000342578081fd5b5035919050565b6001600160a01b0391909116815260200190565b6001600160a01b039390931683526020830191909152604082015260600190565b6020808252825182820181905260009190848201906040850190845b81811015620003c15783516001600160a01b0316835292840192918401916001016200039a565b50909695505050505050565b6000868252602060018060a01b0380881682850152808716604085015280861660608501525060a0608084015283518060a0850152825b81811015620004225785810183015185820160c00152820162000404565b8181111562000434578360c083870101525b50601f01601f19169290920160c001979650505050505050565b634e487b7160e01b600052604160045260246000fdfe60806040523480156200001157600080fd5b506040516200143a3803806200143a8339810160408190526200003491620003eb565b6040805180820190915281815242602080830191909152600780546001810182556000919091528251805160029092027fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c688019262000098928492909101906200032d565b506020918201516001918201556040805160e08101825288815230818501819052339282018390526001600160a01b03898116606084018190528982166080850181905291891660a0850181905260c0850189905260008d815587546001600160a01b03199081169095179097556002805485169096179095556003805484169091179055600480548316909117905560058054909116909217909155835190926200014a916006918601906200032d565b506200015c9150859050600162000167565b505050505062000576565b62000172826200028f565b15620001e0576001600160a01b038216600090815260096020526040902054600880548392908110620001b557634e487b7160e01b600052603260045260246000fd5b60009182526020909120018054911515600160a01b0260ff60a01b199092169190911790556200028b565b604080518082019091526001600160a01b038084168252821515602083019081526008805460018181018355600083905294517ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee3909101805493511515600160a01b0260ff60a01b19929095166001600160a01b0319909416939093171692909217905554620002719190620004ff565b6001600160a01b0383166000908152600960205260409020555b5050565b6001600160a01b038116600090815260096020526040812054600854620002bb57600091505062000328565b6008548110620002d057600091505062000328565b826001600160a01b031660088281548110620002fc57634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b0316146200032257600091505062000328565b60019150505b919050565b8280546200033b9062000523565b90600052602060002090601f0160209004810192826200035f5760008555620003aa565b82601f106200037a57805160ff1916838001178555620003aa565b82800160010185558215620003aa579182015b82811115620003aa5782518255916020019190600101906200038d565b50620003b8929150620003bc565b5090565b5b80821115620003b85760008155600101620003bd565b80516001600160a01b03811681146200032857600080fd5b600080600080600060a0868803121562000403578081fd5b85519450602062000416818801620003d3565b94506200042660408801620003d3565b93506200043660608801620003d3565b60808801519093506001600160401b038082111562000453578384fd5b818901915089601f83011262000467578384fd5b8151818111156200047c576200047c62000560565b604051601f8201601f1916810185018381118282101715620004a257620004a262000560565b60405281815283820185018c1015620004b9578586fd5b8592505b81831015620004dc5783830185015181840186015291840191620004bd565b81831115620004ed57858583830101525b80955050505050509295509295909350565b6000828210156200051e57634e487b7160e01b81526011600452602481fd5b500390565b6002810460018216806200053857607f821691505b602082108114156200055a57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b610eb480620005866000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063937f6e7711610066578063937f6e771461011c57806398e162551461012f578063cd9b4a1114610144578063dd30b0c714610164578063e7283755146101795761009e565b80630fcb0ae5146100a35780631865c57d146100b85780632af4c31e146100d65780633657e851146100e957806360f6899314610109575b600080fd5b6100b66100b1366004610a20565b61018c565b005b6100c0610213565b6040516100cd9190610d93565b60405180910390f35b6100b66100e4366004610a20565b610306565b6100fc6100f7366004610a20565b6103a4565b6040516100cd9190610c76565b6100b6610117366004610a20565b610423565b6100b661012a366004610a4e565b6104c5565b6101376105a4565b6040516100cd9190610ba9565b610157610152366004610a20565b61069f565b6040516100cd9190610e07565b61016c6106b1565b6040516100cd9190610c1c565b6100b6610187366004610a20565b610720565b6005546001600160a01b031633146101bf5760405162461bcd60e51b81526004016101b690610cf7565b60405180910390fd5b6101ca816001610793565b336001600160a01b03167f031b7bf49a2340714b695ae019eaa006c2e4c89b5e9ede80e3929d7e9465198c8260014260405161020893929190610b88565b60405180910390a250565b61021b610949565b6040805160e0810182526000805482526001546001600160a01b039081166020840152600254811693830193909352600354831660608301526004548316608083015260055490921660a08201526006805491929160c08401919061027f90610e33565b80601f01602080910402602001604051908101604052809291908181526020018280546102ab90610e33565b80156102f85780601f106102cd576101008083540402835291602001916102f8565b820191906000526020600020905b8154815290600101906020018083116102db57829003601f168201915b505050505081525050905090565b6003546001600160a01b031633146103305760405162461bcd60e51b81526004016101b690610caf565b600380546001600160a01b038381166001600160a01b03198316179092551661035a816000610793565b610365826001610793565b7fb4fa0c8f1565e6385961540cac5b9884d84157c515100cf972728e8be8dacdd333834260405161039893929190610b64565b60405180910390a15050565b6000806103b0836108b4565b9050806103c157600091505061041e565b6001600160a01b0383166000908152600960205260409020546008805490919081106103fd57634e487b7160e01b600052603260045260246000fd5b600091825260209091200154600160a01b900460ff16915061041e9050565b505b919050565b6003546001600160a01b031633148061044657506005546001600160a01b031633145b6104625760405162461bcd60e51b81526004016101b690610d49565b600580546001600160a01b0319166001600160a01b0383811691909117918290556040517fe4ff1f605955e821f9e684f2d7249e6ff8a5a14f51779fc709d118d7dbf6e9fe926104ba92339291169085904290610b3a565b60405180910390a150565b6003546001600160a01b031633146104ef5760405162461bcd60e51b81526004016101b690610caf565b6040805180820190915281815242602080830191909152600780546001810182556000919091528251805160029092027fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c688019261055192849290910190610987565b5060209182015160019091015581516105709160069190840190610987565b507f39b28594242c42fce47a0a6e63bac12adbd07fbb35580f5a54b236858101d58a8133426040516104ba93929190610c81565b60606007805480602002602001604051908101604052809291908181526020016000905b8282101561069657838290600052602060002090600202016040518060400160405290816000820180546105fb90610e33565b80601f016020809104026020016040519081016040528092919081815260200182805461062790610e33565b80156106745780601f1061064957610100808354040283529160200191610674565b820191906000526020600020905b81548152906001019060200180831161065757829003601f168201915b50505050508152602001600182015481525050815260200190600101906105c8565b50505050905090565b60096020526000908152604090205481565b60606008805480602002602001604051908101604052809291908181526020016000905b8282101561069657600084815260209081902060408051808201909152908401546001600160a01b0381168252600160a01b900460ff161515818301528252600190920191016106d5565b6005546001600160a01b0316331461074a5760405162461bcd60e51b81526004016101b690610cf7565b610755816000610793565b336001600160a01b03167f031b7bf49a2340714b695ae019eaa006c2e4c89b5e9ede80e3929d7e9465198c8260004260405161020893929190610b88565b61079c826108b4565b15610807576001600160a01b0382166000908152600960205260409020546008805483929081106107dd57634e487b7160e01b600052603260045260246000fd5b60009182526020909120018054911515600160a01b0260ff60a01b199092169190911790556108b0565b604080518082019091526001600160a01b038084168252821515602083019081526008805460018181018355600083905294517ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee3909101805493511515600160a01b0260ff60a01b19929095166001600160a01b03199094169390931716929092179055546108969190610e10565b6001600160a01b0383166000908152600960205260409020555b5050565b6001600160a01b0381166000908152600960205260408120546008546108de57600091505061041e565b60085481106108f157600091505061041e565b826001600160a01b03166008828154811061091c57634e487b7160e01b600052603260045260246000fd5b6000918252602090912001546001600160a01b03161461094057600091505061041e565b50600192915050565b6040805160e08101825260008082526020820181905291810182905260608082018390526080820183905260a082019290925260c081019190915290565b82805461099390610e33565b90600052602060002090601f0160209004810192826109b557600085556109fb565b82601f106109ce57805160ff19168380011785556109fb565b828001600101855582156109fb579182015b828111156109fb5782518255916020019190600101906109e0565b50610a07929150610a0b565b5090565b5b80821115610a075760008155600101610a0c565b600060208284031215610a31578081fd5b81356001600160a01b0381168114610a47578182fd5b9392505050565b60006020808385031215610a60578182fd5b823567ffffffffffffffff80821115610a77578384fd5b818501915085601f830112610a8a578384fd5b813581811115610a9c57610a9c610e68565b604051601f8201601f1916810185018381118282101715610abf57610abf610e68565b6040528181528382018501881015610ad5578586fd5b818585018683013790810190930193909352509392505050565b60008151808452815b81811015610b1457602081850181015186830182015201610af8565b81811115610b255782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b039485168152928416602084015292166040820152606081019190915260800190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b039390931683529015156020830152604082015260600190565b60208082528251828201819052600091906040908185019080840286018301878501865b83811015610c0e57888303603f1901855281518051878552610bf188860182610aef565b918901519489019490945294870194925090860190600101610bcd565b509098975050505050505050565b602080825282518282018190526000919060409081850190868401855b82811015610c6957815180516001600160a01b031685528601511515868501529284019290850190600101610c39565b5091979650505050505050565b901515815260200190565b600060608252610c946060830186610aef565b6001600160a01b039490941660208301525060400152919050565b60208082526028908201527f4973737565723a204f6e6c79206f776e65722063616e206d616b6520746869736040820152671030b1ba34b7b71760c11b606082015260800190565b60208082526032908201527f4973737565723a204f6e6c792077616c6c657420617070726f7665722063616e6040820152711036b0b5b2903a3434b99030b1ba34b7b71760711b606082015260800190565b6020808252602a908201527f4973737565723a206e6f7420616c6c6f77656420746f2063616c6c207468697360408201526910333ab731ba34b7b71760b11b606082015260800190565b60006020825282516020830152602083015160018060a01b0380821660408501528060408601511660608501528060608601511660808501528060808601511660a08501528060a08601511660c0850152505060c083015160e080840152610dff610100840182610aef565b949350505050565b90815260200190565b600082821015610e2e57634e487b7160e01b81526011600452602481fd5b500390565b600281046001821680610e4757607f821691505b6020821081141561041c57634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052604160045260246000fdfea2646970667358221220385e434542db4e0225dbf8e29e3e7a8446915d69efb030b63051551ec7cff4ef64736f6c63430008000033a264697066735822122079e1cc74ba535667525b14b9085c936db211a4b705083ad3cf92bac3ef9f127d64736f6c63430008000033";

export class IssuerFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<IssuerFactory> {
    return super.deploy(overrides || {}) as Promise<IssuerFactory>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): IssuerFactory {
    return super.attach(address) as IssuerFactory;
  }
  connect(signer: Signer): IssuerFactory__factory {
    return super.connect(signer) as IssuerFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): IssuerFactoryInterface {
    return new utils.Interface(_abi) as IssuerFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IssuerFactory {
    return new Contract(address, _abi, signerOrProvider) as IssuerFactory;
  }
}
