/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PayoutManager, PayoutManagerInterface } from "../PayoutManager";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_assetAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "asset",
    outputs: [
      {
        internalType: "contract IAsset",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "createPayout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "payouts",
    outputs: [
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalReleased",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
    ],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
    ],
    name: "released",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
    ],
    name: "shares",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
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
    name: "snapshotToPayout",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "snapshotId",
        type: "uint256",
      },
    ],
    name: "totalReleased",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalShares",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162001c0038038062001c008339818101604052810190620000379190620000d7565b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505062000166565b600081519050620000d1816200014c565b92915050565b60008060408385031215620000eb57600080fd5b6000620000fb85828601620000c0565b92505060206200010e85828601620000c0565b9150509250929050565b600062000125826200012c565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b620001578162000118565b81146200016357600080fd5b50565b611a8a80620001766000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c80638da5cb5b116100665780638da5cb5b1461015e578063adeca8821461017c578063c21211a314610198578063cfe83070146101c8578063d430119b146101f85761009e565b80630357371d146100a3578063259ddefc146100bf57806329652e86146100ef57806338d52e0f146101225780633a98ef3914610140575b600080fd5b6100bd60048036038101906100b89190611164565b610228565b005b6100d960048036038101906100d49190611164565b6105e7565b6040516100e6919061162a565b60405180910390f35b61010960048036038101906101049190611246565b6105fb565b6040516101199493929190611645565b60405180910390f35b61012a6106c3565b604051610137919061154d565b60405180910390f35b6101486106e9565b604051610155919061162a565b60405180910390f35b610166610790565b60405161017391906114d2565b60405180910390f35b610196600480360381019061019191906111f2565b6107b4565b005b6101b260048036038101906101ad9190611246565b610ae2565b6040516101bf919061162a565b60405180910390f35b6101e260048036038101906101dd9190611164565b610afa565b6040516101ef919061162a565b60405180910390f35b610212600480360381019061020d9190611246565b610ba0565b60405161021f919061162a565b60405180910390f35b60006002600360008481526020019081526020016000205481548110610277577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000209060050201905060006102938484610c08565b9050600081116102d8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102cf906115aa565b60405180910390fd5b60008260040160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633a98ef396040518163ffffffff1660e01b815260040160206040518083038186803b15801561038457600080fd5b505afa158015610398573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103bc919061126f565b8385600201546103cc91906117ab565b6103d6919061177a565b6103e09190611805565b90506000811415610426576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041d9061160a565b60405180910390fd5b808360040160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104779190611724565b92505081905550808360030160008282546104929190611724565b925050819055506105e08582600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16631d1438486040518163ffffffff1660e01b815260040160206040518083038186803b15801561050657600080fd5b505afa15801561051a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061053e91906111c9565b73ffffffffffffffffffffffffffffffffffffffff1663e9cbd8226040518163ffffffff1660e01b815260040160206040518083038186803b15801561058357600080fd5b505afa158015610597573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105bb919061113b565b73ffffffffffffffffffffffffffffffffffffffff16610cbf9092919063ffffffff16565b5050505050565b60006105f38383610c08565b905092915050565b6002818154811061060b57600080fd5b9060005260206000209060050201600091509050806000015490806001018054610634906118f9565b80601f0160208091040260200160405190810160405280929190818152602001828054610660906118f9565b80156106ad5780601f10610682576101008083540402835291602001916106ad565b820191906000526020600020905b81548152906001019060200180831161069057829003601f168201915b5050505050908060020154908060030154905084565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633a98ef396040518163ffffffff1660e01b815260040160206040518083038186803b15801561075357600080fd5b505afa158015610767573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061078b919061126f565b905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461080c57600080fd5b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16631d1438486040518163ffffffff1660e01b815260040160206040518083038186803b15801561087657600080fd5b505afa15801561088a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108ae91906111c9565b73ffffffffffffffffffffffffffffffffffffffff1663e9cbd8226040518163ffffffff1660e01b815260040160206040518083038186803b1580156108f357600080fd5b505afa158015610907573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061092b919061113b565b90506000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16639711715a6040518163ffffffff1660e01b8152600401602060405180830381600087803b15801561099957600080fd5b505af11580156109ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109d1919061126f565b90508173ffffffffffffffffffffffffffffffffffffffff166323b872dd3330866040518463ffffffff1660e01b8152600401610a10939291906114ed565b602060405180830381600087803b158015610a2a57600080fd5b505af1158015610a3e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a6291906111a0565b5060006002600181600181540180825580915050039060005260206000209060050201905081816000018190555084816001019080519060200190610aa8929190610fb2565b508381600201819055506001600280549050610ac49190611805565b60036000848152602001908152602001600020819055505050505050565b60036020528060005260406000206000915090505481565b60006002600360008481526020019081526020016000205481548110610b49577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b906000526020600020906005020160040160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b60006002600360008481526020019081526020016000205481548110610bef577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000209060050201600301549050919050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16634ee2cd7e84846040518363ffffffff1660e01b8152600401610c67929190611524565b60206040518083038186803b158015610c7f57600080fd5b505afa158015610c93573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cb7919061126f565b905092915050565b610d408363a9059cbb60e01b8484604051602401610cde929190611524565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610d45565b505050565b6000610da7826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16610e0c9092919063ffffffff16565b9050600081511115610e075780806020019051810190610dc791906111a0565b610e06576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dfd906115ea565b60405180910390fd5b5b505050565b6060610e1b8484600085610e24565b90509392505050565b606082471015610e69576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e609061158a565b60405180910390fd5b610e7285610f38565b610eb1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ea8906115ca565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051610eda91906114bb565b60006040518083038185875af1925050503d8060008114610f17576040519150601f19603f3d011682016040523d82523d6000602084013e610f1c565b606091505b5091509150610f2c828286610f4b565b92505050949350505050565b600080823b905060008111915050919050565b60608315610f5b57829050610fab565b600083511115610f6e5782518084602001fd5b816040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fa29190611568565b60405180910390fd5b9392505050565b828054610fbe906118f9565b90600052602060002090601f016020900481019282610fe05760008555611027565b82601f10610ff957805160ff1916838001178555611027565b82800160010185558215611027579182015b8281111561102657825182559160200191906001019061100b565b5b5090506110349190611038565b5090565b5b80821115611051576000816000905550600101611039565b5090565b6000611068611063846116c2565b611691565b90508281526020810184848401111561108057600080fd5b61108b8482856118b7565b509392505050565b6000813590506110a2816119f8565b92915050565b6000815190506110b7816119f8565b92915050565b6000815190506110cc81611a0f565b92915050565b6000815190506110e181611a26565b92915050565b600082601f8301126110f857600080fd5b8135611108848260208601611055565b91505092915050565b60008135905061112081611a3d565b92915050565b60008151905061113581611a3d565b92915050565b60006020828403121561114d57600080fd5b600061115b848285016110a8565b91505092915050565b6000806040838503121561117757600080fd5b600061118585828601611093565b925050602061119685828601611111565b9150509250929050565b6000602082840312156111b257600080fd5b60006111c0848285016110bd565b91505092915050565b6000602082840312156111db57600080fd5b60006111e9848285016110d2565b91505092915050565b6000806040838503121561120557600080fd5b600083013567ffffffffffffffff81111561121f57600080fd5b61122b858286016110e7565b925050602061123c85828601611111565b9150509250929050565b60006020828403121561125857600080fd5b600061126684828501611111565b91505092915050565b60006020828403121561128157600080fd5b600061128f84828501611126565b91505092915050565b6112a181611839565b82525050565b60006112b2826116f2565b6112bc8185611708565b93506112cc8185602086016118c6565b80840191505092915050565b6112e181611893565b82525050565b60006112f2826116fd565b6112fc8185611713565b935061130c8185602086016118c6565b611315816119e7565b840191505092915050565b600061132d602683611713565b91507f416464726573733a20696e73756666696369656e742062616c616e636520666f60008301527f722063616c6c00000000000000000000000000000000000000000000000000006020830152604082019050919050565b6000611393601683611713565b91507f4163636f756e7420686173206e6f207368617265732e000000000000000000006000830152602082019050919050565b60006113d3601d83611713565b91507f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006000830152602082019050919050565b6000611413602a83611713565b91507f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008301527f6f742073756363656564000000000000000000000000000000000000000000006020830152604082019050919050565b6000611479601b83611713565b91507f4163636f756e74206973206e6f7420647565207061796d656e742e00000000006000830152602082019050919050565b6114b581611889565b82525050565b60006114c782846112a7565b915081905092915050565b60006020820190506114e76000830184611298565b92915050565b60006060820190506115026000830186611298565b61150f6020830185611298565b61151c60408301846114ac565b949350505050565b60006040820190506115396000830185611298565b61154660208301846114ac565b9392505050565b600060208201905061156260008301846112d8565b92915050565b6000602082019050818103600083015261158281846112e7565b905092915050565b600060208201905081810360008301526115a381611320565b9050919050565b600060208201905081810360008301526115c381611386565b9050919050565b600060208201905081810360008301526115e3816113c6565b9050919050565b6000602082019050818103600083015261160381611406565b9050919050565b600060208201905081810360008301526116238161146c565b9050919050565b600060208201905061163f60008301846114ac565b92915050565b600060808201905061165a60008301876114ac565b818103602083015261166c81866112e7565b905061167b60408301856114ac565b61168860608301846114ac565b95945050505050565b6000604051905081810181811067ffffffffffffffff821117156116b8576116b76119b8565b5b8060405250919050565b600067ffffffffffffffff8211156116dd576116dc6119b8565b5b601f19601f8301169050602081019050919050565b600081519050919050565b600081519050919050565b600081905092915050565b600082825260208201905092915050565b600061172f82611889565b915061173a83611889565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561176f5761176e61192b565b5b828201905092915050565b600061178582611889565b915061179083611889565b9250826117a05761179f61195a565b5b828204905092915050565b60006117b682611889565b91506117c183611889565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156117fa576117f961192b565b5b828202905092915050565b600061181082611889565b915061181b83611889565b92508282101561182e5761182d61192b565b5b828203905092915050565b600061184482611869565b9050919050565b60008115159050919050565b600061186282611839565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600061189e826118a5565b9050919050565b60006118b082611869565b9050919050565b82818337600083830152505050565b60005b838110156118e45780820151818401526020810190506118c9565b838111156118f3576000848401525b50505050565b6000600282049050600182168061191157607f821691505b6020821081141561192557611924611989565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b611a0181611839565b8114611a0c57600080fd5b50565b611a188161184b565b8114611a2357600080fd5b50565b611a2f81611857565b8114611a3a57600080fd5b50565b611a4681611889565b8114611a5157600080fd5b5056fea26469706673582212206364e8ca62c1877c74bbcb437386fb2d590424d29d5da16cc53dd7129762f4cd64736f6c63430008000033";

export class PayoutManager__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _owner: string,
    _assetAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PayoutManager> {
    return super.deploy(
      _owner,
      _assetAddress,
      overrides || {}
    ) as Promise<PayoutManager>;
  }
  getDeployTransaction(
    _owner: string,
    _assetAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_owner, _assetAddress, overrides || {});
  }
  attach(address: string): PayoutManager {
    return super.attach(address) as PayoutManager;
  }
  connect(signer: Signer): PayoutManager__factory {
    return super.connect(signer) as PayoutManager__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PayoutManagerInterface {
    return new utils.Interface(_abi) as PayoutManagerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PayoutManager {
    return new Contract(address, _abi, signerOrProvider) as PayoutManager;
  }
}