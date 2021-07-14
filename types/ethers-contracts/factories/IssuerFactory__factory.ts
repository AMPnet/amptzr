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
        indexed: false,
        internalType: "address",
        name: "_asset",
        type: "address",
      },
    ],
    name: "IssuerCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_stablecoin",
        type: "address",
      },
      {
        internalType: "address",
        name: "_registry",
        type: "address",
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
  "0x608060405234801561001057600080fd5b50611ea8806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80639c041ebd14610046578063a2f7b3a514610076578063d35fdd79146100a6575b600080fd5b610060600480360381019061005b91906102aa565b6100c4565b60405161006d91906103b6565b60405180910390f35b610090600480360381019061008b91906102f9565b6101a6565b60405161009d91906103b6565b60405180910390f35b6100ae6101e5565b6040516100bb9190610408565b60405180910390f35b6000808484846040516100d690610273565b6100e2939291906103d1565b604051809103906000f0801580156100fe573d6000803e3d6000fd5b5090506000819080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507faad6773898803045a4b9ff92108da563cd9755ab7f252e45823cc485d8300f638160405161019391906103b6565b60405180910390a1809150509392505050565b600081815481106101b657600080fd5b906000526020600020016000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6060600080548060200260200160405190810160405280929190818152602001828054801561026957602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001906001019080831161021f575b5050505050905090565b6119a5806104ce83390190565b60008135905061028f8161049f565b92915050565b6000813590506102a4816104b6565b92915050565b6000806000606084860312156102bf57600080fd5b60006102cd86828701610280565b93505060206102de86828701610280565b92505060406102ef86828701610280565b9150509250925092565b60006020828403121561030b57600080fd5b600061031984828501610295565b91505092915050565b600061032e838361033a565b60208301905092915050565b61034381610463565b82525050565b61035281610463565b82525050565b60006103638261043a565b61036d8185610452565b93506103788361042a565b8060005b838110156103a95781516103908882610322565b975061039b83610445565b92505060018101905061037c565b5085935050505092915050565b60006020820190506103cb6000830184610349565b92915050565b60006060820190506103e66000830186610349565b6103f36020830185610349565b6104006040830184610349565b949350505050565b600060208201905081810360008301526104228184610358565b905092915050565b6000819050602082019050919050565b600081519050919050565b6000602082019050919050565b600082825260208201905092915050565b600061046e82610475565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b6104a881610463565b81146104b357600080fd5b50565b6104bf81610495565b81146104ca57600080fd5b5056fe60806040523480156200001157600080fd5b50604051620019a5380380620019a5833981810160405281019062000037919062000119565b826000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505050620001bd565b6000815190506200011381620001a3565b92915050565b6000806000606084860312156200012f57600080fd5b60006200013f8682870162000102565b9350506020620001528682870162000102565b9250506040620001658682870162000102565b9150509250925092565b60006200017c8262000183565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b620001ae816200016f565b8114620001ba57600080fd5b50565b6117d880620001cd6000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806367ee325211610097578063b84bc82011610066578063b84bc82014610288578063cf35bdd0146102b8578063e7283755146102e8578063e9cbd82214610304576100f5565b806367ee3252146102005780637b103999146102305780638da5cb5b1461024e578063937f6e771461026c576100f5565b80633657e851116100d35780633657e85114610164578063370158ea1461019457806357c14628146101b257806367e4ac2c146101e2576100f5565b80630a26086d146100fa5780630c21f3211461012a5780630fcb0ae514610148575b600080fd5b610114600480360381019061010f9190611073565b610322565b6040516101219190611380565b60405180910390f35b610132610361565b60405161013f919061145d565b60405180910390f35b610162600480360381019061015d9190610fe0565b6103ef565b005b61017e60048036038101906101799190610fe0565b6104a2565b60405161018b919061147f565b60405180910390f35b61019c6104f8565b6040516101a991906114b5565b60405180910390f35b6101cc60048036038101906101c79190610fe0565b610586565b6040516101d9919061147f565b60405180910390f35b6101ea6105a6565b6040516101f7919061145d565b60405180910390f35b61021a6004803603810190610215919061109c565b610634565b6040516102279190611380565b60405180910390f35b61023861086e565b604051610245919061149a565b60405180910390f35b610256610894565b6040516102639190611380565b60405180910390f35b61028660048036038101906102819190611032565b6108b8565b005b6102a2600480360381019061029d9190611143565b61092a565b6040516102af9190611380565b60405180910390f35b6102d260048036038101906102cd9190611073565b610d69565b6040516102df9190611380565b60405180910390f35b61030260048036038101906102fd9190610fe0565b610da8565b005b61030c610e5b565b6040516103199190611380565b60405180910390f35b6005818154811061033257600080fd5b906000526020600020016000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b606060058054806020026020016040519081016040528092919081815260200182805480156103e557602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001906001019080831161039b575b5050505050905090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461044757600080fd5b6001600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b6000600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b6006805461050590611680565b80601f016020809104026020016040519081016040528092919081815260200182805461053190611680565b801561057e5780601f106105535761010080835404028352916020019161057e565b820191906000526020600020905b81548152906001019060200180831161056157829003601f168201915b505050505081565b60036020528060005260406000206000915054906101000a900460ff1681565b6060600480548060200260200160405190810160405280929190818152602001828054801561062a57602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116105e0575b5050505050905090565b600033600360008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166106c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106ba906114d7565b60405180910390fd5b6000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663c3acb4d16040518163ffffffff1660e01b815260040160206040518083038186803b15801561072d57600080fd5b505afa158015610741573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107659190611009565b73ffffffffffffffffffffffffffffffffffffffff1663d5e5ad8c3330898c8c8b8b6040518863ffffffff1660e01b81526004016107a9979695949392919061139b565b602060405180830381600087803b1580156107c357600080fd5b505af11580156107d7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107fb9190611009565b90506004819080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550809250505095945050505050565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461091057600080fd5b8060069080519060200190610926929190610e81565b5050565b600033600360008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166109b9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109b0906114d7565b60405180910390fd5b600080600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16639720983c6040518163ffffffff1660e01b815260040160206040518083038186803b158015610a2457600080fd5b505afa158015610a38573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a5c9190611009565b73ffffffffffffffffffffffffffffffffffffffff16638c71ec16338989896040518563ffffffff1660e01b8152600401610a9a9493929190611418565b602060405180830381600087803b158015610ab457600080fd5b505af1158015610ac8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610aec9190611009565b9150600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663c3acb4d16040518163ffffffff1660e01b815260040160206040518083038186803b158015610b5657600080fd5b505afa158015610b6a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b8e9190611009565b73ffffffffffffffffffffffffffffffffffffffff1663d5e5ad8c833060008f8f8f8f6040518863ffffffff1660e01b8152600401610bd3979695949392919061139b565b602060405180830381600087803b158015610bed57600080fd5b505af1158015610c01573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c259190611009565b90508173ffffffffffffffffffffffffffffffffffffffff1663d0d552dd826040518263ffffffff1660e01b8152600401610c609190611380565b600060405180830381600087803b158015610c7a57600080fd5b505af1158015610c8e573d6000803e3d6000fd5b505050506004819080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506005829080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550819350505050979650505050505050565b60048181548110610d7957600080fd5b906000526020600020016000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610e0057600080fd5b6000600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b828054610e8d90611680565b90600052602060002090601f016020900481019282610eaf5760008555610ef6565b82601f10610ec857805160ff1916838001178555610ef6565b82800160010185558215610ef6579182015b82811115610ef5578251825591602001919060010190610eda565b5b509050610f039190610f07565b5090565b5b80821115610f20576000816000905550600101610f08565b5090565b6000610f37610f3284611528565b6114f7565b905082815260208101848484011115610f4f57600080fd5b610f5a84828561163e565b509392505050565b600081359050610f7181611764565b92915050565b600081519050610f8681611764565b92915050565b600081359050610f9b8161177b565b92915050565b600082601f830112610fb257600080fd5b8135610fc2848260208601610f24565b91505092915050565b600081359050610fda8161178b565b92915050565b600060208284031215610ff257600080fd5b600061100084828501610f62565b91505092915050565b60006020828403121561101b57600080fd5b600061102984828501610f77565b91505092915050565b60006020828403121561104457600080fd5b600082013567ffffffffffffffff81111561105e57600080fd5b61106a84828501610fa1565b91505092915050565b60006020828403121561108557600080fd5b600061109384828501610fcb565b91505092915050565b600080600080600060a086880312156110b457600080fd5b60006110c288828901610fcb565b95505060206110d388828901610fcb565b94505060406110e488828901610f8c565b935050606086013567ffffffffffffffff81111561110157600080fd5b61110d88828901610fa1565b925050608086013567ffffffffffffffff81111561112a57600080fd5b61113688828901610fa1565b9150509295509295909350565b600080600080600080600060e0888a03121561115e57600080fd5b600061116c8a828b01610fcb565b975050602061117d8a828b01610fcb565b965050604088013567ffffffffffffffff81111561119a57600080fd5b6111a68a828b01610fa1565b955050606088013567ffffffffffffffff8111156111c357600080fd5b6111cf8a828b01610fa1565b94505060806111e08a828b01610fcb565b93505060a06111f18a828b01610fcb565b92505060c06112028a828b01610fcb565b91505092959891949750929550565b600061121d8383611229565b60208301905092915050565b611232816115ad565b82525050565b611241816115ad565b82525050565b600061125282611568565b61125c818561158b565b935061126783611558565b8060005b8381101561129857815161127f8882611211565b975061128a8361157e565b92505060018101905061126b565b5085935050505092915050565b6112ae816115bf565b82525050565b6112bd81611608565b82525050565b6112cc8161162c565b82525050565b60006112dd82611573565b6112e7818561159c565b93506112f781856020860161164d565b6113008161173f565b840191505092915050565b6000611318603c8361159c565b91507f5468697320616374696f6e20697320666f7262696464656e2e2057616c6c657460008301527f206e6f7420617070726f76656420627920746865204973737565722e000000006020830152604082019050919050565b61137a816115fe565b82525050565b60006020820190506113956000830184611238565b92915050565b600060e0820190506113b0600083018a611238565b6113bd6020830189611238565b6113ca60408301886112c3565b6113d76060830187611371565b6113e46080830186611371565b81810360a08301526113f681856112d2565b905081810360c083015261140a81846112d2565b905098975050505050505050565b600060808201905061142d6000830187611238565b61143a6020830186611371565b6114476040830185611371565b6114546060830184611371565b95945050505050565b600060208201905081810360008301526114778184611247565b905092915050565b600060208201905061149460008301846112a5565b92915050565b60006020820190506114af60008301846112b4565b92915050565b600060208201905081810360008301526114cf81846112d2565b905092915050565b600060208201905081810360008301526114f08161130b565b9050919050565b6000604051905081810181811067ffffffffffffffff8211171561151e5761151d611710565b5b8060405250919050565b600067ffffffffffffffff82111561154357611542611710565b5b601f19601f8301169050602081019050919050565b6000819050602082019050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b60006115b8826115de565b9050919050565b60008115159050919050565b60008190506115d982611750565b919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60006116138261161a565b9050919050565b6000611625826115de565b9050919050565b6000611637826115cb565b9050919050565b82818337600083830152505050565b60005b8381101561166b578082015181840152602081019050611650565b8381111561167a576000848401525b50505050565b6000600282049050600182168061169857607f821691505b602082108114156116ac576116ab6116e1565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b60028110611761576117606116b2565b5b50565b61176d816115ad565b811461177857600080fd5b50565b6002811061178857600080fd5b50565b611794816115fe565b811461179f57600080fd5b5056fea2646970667358221220c04d22131f126df2b8957a5b508fe1044e3d281e9845f2b77bd9e3bef5053d1764736f6c63430008000033a264697066735822122062735be5b696f444f146ac26e8155d19897839bb171c84f3dbfd69259e1234b364736f6c63430008000033";

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
