/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  PayoutManagerFactory,
  PayoutManagerFactoryInterface,
} from "../PayoutManagerFactory";

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
        name: "payoutManager",
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
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PayoutManagerCreated",
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
        name: "assetAddress",
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
        internalType: "address",
        name: "asset",
        type: "address",
      },
    ],
    name: "getInstancesForAsset",
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
        internalType: "address",
        name: "issuer",
        type: "address",
      },
    ],
    name: "getInstancesForIssuer",
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
  "0x608060405234801561001057600080fd5b50612277806100206000396000f3fe60806040523480156200001157600080fd5b50600436106200005e5760003560e01c8063238c3a901462000063578063498f28621462000092578063a2f7b3a514620000a9578063b8b70cac14620000cf578063d35fdd7914620000e6575b600080fd5b6200007a62000074366004620004c0565b620000f0565b6040516200008991906200071f565b60405180910390f35b6200007a620000a3366004620004c0565b62000169565b620000c0620000ba366004620006c8565b620001df565b604051620000899190620006e1565b620000c0620000e0366004620004e6565b6200020a565b6200007a620003d8565b6001600160a01b0381166000908152600160209081526040918290208054835181840281018401909452808452606093928301828280156200015c57602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116200013d575b505050505090505b919050565b6001600160a01b0381166000908152600260209081526040918290208054835181840281018401909452808452606093928301828280156200015c576020028201919060005260206000209081546001600160a01b031681526001909101906020018083116200013d5750505050509050919050565b60008181548110620001f057600080fd5b6000918252602090912001546001600160a01b0316905081565b600080546040518290829087908790879062000226906200043c565b6200023594939291906200076e565b604051809103906000f08015801562000252573d6000803e3d6000fd5b5060008054600180820183558280527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e56390910180546001600160a01b0319166001600160a01b038581169190911790915560408051631865c57d60e01b81529051949550919390891691631865c57d9160048083019286929190829003018186803b158015620002e157600080fd5b505afa158015620002f6573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526200032091908101906200058c565b60c001516001600160a01b039081168252602080830193909352604091820160009081208054600181810183559183528583200180548785166001600160a01b031991821681179092558b8516845260028752858420805493840181558452959092200180549094161790925551908716907fc99aeeec111b9962b2902fe22bcc245ec778639adff36c6fce0b84a7f31bc3ad90620003c790849086908a904290620006f5565b60405180910390a295945050505050565b606060008054806020026020016040519081016040528092919081815260200182805480156200043257602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831162000413575b5050505050905090565b6119c3806200087f83390190565b8051620001648162000865565b805180151581146200016457600080fd5b600082601f83011262000479578081fd5b8151620004906200048a82620007f1565b620007c4565b818152846020838601011115620004a5578283fd5b620004b88260208301602087016200081c565b949350505050565b600060208284031215620004d2578081fd5b8135620004df8162000865565b9392505050565b600080600060608486031215620004fb578182fd5b8335620005088162000865565b925060208401356200051a8162000865565b9150604084013567ffffffffffffffff81111562000536578182fd5b8401601f8101861362000547578182fd5b8035620005586200048a82620007f1565b8181528760208385010111156200056d578384fd5b8160208401602083013783602083830101528093505050509250925092565b6000602082840312156200059e578081fd5b815167ffffffffffffffff80821115620005b6578283fd5b8184019150610140808387031215620005cd578384fd5b620005d881620007c4565b905082518152620005ec602084016200044a565b6020820152620005ff604084016200044a565b6040820152606083015160608201526200061c6080840162000457565b60808201526200062f60a0840162000457565b60a08201526200064260c084016200044a565b60c082015260e08301518281111562000659578485fd5b620006678782860162000468565b60e083015250610100808401518381111562000681578586fd5b6200068f8882870162000468565b8284015250506101208084015183811115620006a9578586fd5b620006b78882870162000468565b918301919091525095945050505050565b600060208284031215620006da578081fd5b5035919050565b6001600160a01b0391909116815260200190565b6001600160a01b039485168152602081019390935292166040820152606081019190915260800190565b6020808252825182820181905260009190848201906040850190845b81811015620007625783516001600160a01b0316835292840192918401916001016200073b565b50909695505050505050565b600085825260018060a01b038086166020840152808516604084015250608060608301528251806080840152620007ad8160a08501602087016200081c565b601f01601f19169190910160a00195945050505050565b60405181810167ffffffffffffffff81118282101715620007e957620007e96200084f565b604052919050565b600067ffffffffffffffff8211156200080e576200080e6200084f565b50601f01601f191660200190565b60005b83811015620008395781810151838201526020016200081f565b8381111562000849576000848401525b50505050565b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146200087b57600080fd5b5056fe60806040523480156200001157600080fd5b50604051620019c3380380620019c3833981016040819052620000349162000172565b604080516080810182528581526001600160a01b038086166020808401829052918616938301849052606083018590526000888155600180546001600160a01b031990811690931790556002805490921690941790558351919291620000a19160039190860190620000af565b5090505050505050620002c4565b828054620000bd9062000271565b90600052602060002090601f016020900481019282620000e157600085556200012c565b82601f10620000fc57805160ff19168380011785556200012c565b828001600101855582156200012c579182015b828111156200012c5782518255916020019190600101906200010f565b506200013a9291506200013e565b5090565b5b808211156200013a57600081556001016200013f565b80516001600160a01b03811681146200016d57600080fd5b919050565b6000806000806080858703121562000188578384fd5b8451935060206200019b81870162000155565b9350620001ab6040870162000155565b60608701519093506001600160401b0380821115620001c8578384fd5b818801915088601f830112620001dc578384fd5b815181811115620001f157620001f1620002ae565b604051601f8201601f1916810185018381118282101715620002175762000217620002ae565b60405281815283820185018b10156200022e578586fd5b8592505b8183101562000251578383018501518184018601529184019162000232565b818311156200026257858583830101525b979a9699509497505050505050565b6002810460018216806200028657607f821691505b60208210811415620002a857634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b6116ef80620002d46000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063937f6e7711610071578063937f6e771461012c57806398e162551461013f578063adeca88214610154578063c21211a314610167578063cfe830701461017a578063d430119b1461018d576100a9565b80630357371d146100ae5780631865c57d146100c3578063259ddefc146100e157806329652e86146101015780633a98ef3914610124575b600080fd5b6100c16100bc366004610f76565b6101a0565b005b6100cb6103b0565b6040516100d891906114ce565b60405180910390f35b6100f46100ef366004610f76565b610483565b6040516100d89190611515565b61011461010f366004611211565b610496565b6040516100d8949392919061151e565b6100f461055a565b6100c161013a366004610fbb565b6105d9565b6101476106b0565b6040516100d891906112ec565b6100c1610162366004610fee565b6107ab565b6100f4610175366004611211565b6109a7565b6100f4610188366004610f76565b6109b9565b6100f461019b366004611211565b610a1c565b60008181526006602052604081205460058054919291839081106101d457634e487b7160e01b600052603260045260246000fd5b9060005260206000209060050201905060006101f08585610a68565b90506000811161021b5760405162461bcd60e51b8152600401610212906113e6565b60405180910390fd5b6001600160a01b038516600090815260048301602052604081205461023e610aeb565b6001600160a01b0316633a98ef396040518163ffffffff1660e01b815260040160206040518083038186803b15801561027657600080fd5b505afa15801561028a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ae9190611229565b8385600201546102be91906115d4565b6102c891906115b4565b6102d291906115f3565b9050806102f15760405162461bcd60e51b815260040161021290611497565b6001600160a01b03861660009081526004840160205260408120805483929061031b90849061159c565b9250508190555080836003016000828254610336919061159c565b9091555061035990508682610349610afa565b6001600160a01b03169190610b81565b6002546040516001600160a01b03888116927f93fede667057c1bd18fa0a628a650c1fc54bd3bd215fbdecbfca4b85a57c0f63926103a092909116908890869042906112c6565b60405180910390a2505050505050565b6103b8610e08565b604080516080810182526000805482526001546001600160a01b0390811660208401526002541692820192909252600380549192916060840191906103fc9061163a565b80601f01602080910402602001604051908101604052809291908181526020018280546104289061163a565b80156104755780601f1061044a57610100808354040283529160200191610475565b820191906000526020600020905b81548152906001019060200180831161045857829003601f168201915b505050505081525050905090565b600061048f8383610a68565b9392505050565b600581815481106104a657600080fd5b600091825260209091206005909102018054600182018054919350906104cb9061163a565b80601f01602080910402602001604051908101604052809291908181526020018280546104f79061163a565b80156105445780601f1061051957610100808354040283529160200191610544565b820191906000526020600020905b81548152906001019060200180831161052757829003601f168201915b5050505050908060020154908060030154905084565b6000610564610aeb565b6001600160a01b0316633a98ef396040518163ffffffff1660e01b815260040160206040518083038186803b15801561059c57600080fd5b505afa1580156105b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105d49190611229565b905090565b6001546001600160a01b031633146105f057600080fd5b6040805180820190915281815242602080830191909152600480546001810182556000919091528251805160029092027f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b019261065292849290910190610e2e565b5060209182015160019091015581516106719160039190840190610e2e565b507f39b28594242c42fce47a0a6e63bac12adbd07fbb35580f5a54b236858101d58a8133426040516106a593929190611372565b60405180910390a150565b60606004805480602002602001604051908101604052809291908181526020016000905b828210156107a257838290600052602060002090600202016040518060400160405290816000820180546107079061163a565b80601f01602080910402602001604051908101604052809291908181526020018280546107339061163a565b80156107805780601f1061075557610100808354040283529160200191610780565b820191906000526020600020905b81548152906001019060200180831161076357829003601f168201915b50505050508152602001600182015481525050815260200190600101906106d4565b50505050905090565b6001546001600160a01b031633146107c257600080fd5b60006107cc610aeb565b6001600160a01b0316639711715a6040518163ffffffff1660e01b8152600401602060405180830381600087803b15801561080657600080fd5b505af115801561081a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061083e9190611229565b9050610848610afa565b6001600160a01b03166323b872dd3330856040518463ffffffff1660e01b815260040161087793929190611289565b602060405180830381600087803b15801561089157600080fd5b505af11580156108a5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108c99190610fa1565b506005805460018101825560008290529081027f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db0810183815585519091610939917f036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db1909101906020880190610e2e565b5060028101849055600554610950906001906115f3565b6000848152600660205260409081902091909155517f37dc393c189f83817570d856284080a2cbb63ad41326d95644617f8970ae3c38906109989033908590889042906112c6565b60405180910390a15050505050565b60066020526000908152604090205481565b6000818152600660205260408120546005805490919081106109eb57634e487b7160e01b600052603260045260246000fd5b600091825260208083206001600160a01b038716845260046005909302019190910190526040902054905092915050565b600081815260066020526040812054600580549091908110610a4e57634e487b7160e01b600052603260045260246000fd5b90600052602060002090600502016003015490505b919050565b60025460405163277166bf60e11b81526000916001600160a01b031690634ee2cd7e90610a9b90869086906004016112ad565b60206040518083038186803b158015610ab357600080fd5b505afa158015610ac7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061048f9190611229565b6002546001600160a01b031690565b6000610b04610bdc565b6001600160a01b0316631865c57d6040518163ffffffff1660e01b815260040160006040518083038186803b158015610b3c57600080fd5b505afa158015610b50573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610b789190810190611155565b60400151905090565b610bd78363a9059cbb60e01b8484604051602401610ba09291906112ad565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152610c63565b505050565b6000610be6610aeb565b6001600160a01b0316631865c57d6040518163ffffffff1660e01b815260040160006040518083038186803b158015610c1e57600080fd5b505afa158015610c32573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610c5a9190810190611031565b60c00151905090565b6000610cb8826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316610cf29092919063ffffffff16565b805190915015610bd75780806020019051810190610cd69190610fa1565b610bd75760405162461bcd60e51b81526004016102129061144d565b6060610d018484600085610d09565b949350505050565b606082471015610d2b5760405162461bcd60e51b8152600401610212906113a0565b610d3485610dc9565b610d505760405162461bcd60e51b815260040161021290611416565b600080866001600160a01b03168587604051610d6c919061126d565b60006040518083038185875af1925050503d8060008114610da9576040519150601f19603f3d011682016040523d82523d6000602084013e610dae565b606091505b5091509150610dbe828286610dcf565b979650505050505050565b3b151590565b60608315610dde57508161048f565b825115610dee5782518084602001fd5b8160405162461bcd60e51b8152600401610212919061135f565b604080516080810182526000808252602082018190529181019190915260608082015290565b828054610e3a9061163a565b90600052602060002090601f016020900481019282610e5c5760008555610ea2565b82601f10610e7557805160ff1916838001178555610ea2565b82800160010185558215610ea2579182015b82811115610ea2578251825591602001919060010190610e87565b50610eae929150610eb2565b5090565b5b80821115610eae5760008155600101610eb3565b8051610a63816116a1565b80518015158114610a6357600080fd5b600082601f830112610ef2578081fd5b8135610f05610f0082611574565b61154a565b818152846020838601011115610f19578283fd5b816020850160208301379081016020019190915292915050565b600082601f830112610f43578081fd5b8151610f51610f0082611574565b818152846020838601011115610f65578283fd5b610d0182602083016020870161160a565b60008060408385031215610f88578182fd5b8235610f93816116a1565b946020939093013593505050565b600060208284031215610fb2578081fd5b61048f82610ed2565b600060208284031215610fcc578081fd5b813567ffffffffffffffff811115610fe2578182fd5b610d0184828501610ee2565b60008060408385031215611000578182fd5b823567ffffffffffffffff811115611016578283fd5b61102285828601610ee2565b95602094909401359450505050565b600060208284031215611042578081fd5b815167ffffffffffffffff80821115611059578283fd5b818401915061014080838703121561106f578384fd5b6110788161154a565b90508251815261108a60208401610ec7565b602082015261109b60408401610ec7565b6040820152606083015160608201526110b660808401610ed2565b60808201526110c760a08401610ed2565b60a08201526110d860c08401610ec7565b60c082015260e0830151828111156110ee578485fd5b6110fa87828601610f33565b60e0830152506101008084015183811115611113578586fd5b61111f88828701610f33565b8284015250506101208084015183811115611138578586fd5b61114488828701610f33565b918301919091525095945050505050565b600060208284031215611166578081fd5b815167ffffffffffffffff8082111561117d578283fd5b9083019060a08286031215611190578283fd5b60405160a0810181811083821117156111ab576111ab61168b565b604052825181526111be60208401610ec7565b60208201526111cf60408401610ec7565b60408201526111e060608401610ec7565b60608201526080830151828111156111f6578485fd5b61120287828601610f33565b60808301525095945050505050565b600060208284031215611222578081fd5b5035919050565b60006020828403121561123a578081fd5b5051919050565b6000815180845261125981602086016020860161160a565b601f01601f19169290920160200192915050565b6000825161127f81846020870161160a565b9190910192915050565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03929092168252602082015260400190565b6001600160a01b0394909416845260208401929092526040830152606082015260800190565b60208082528251828201819052600091906040908185019080840286018301878501865b8381101561135157888303603f190185528151805187855261133488860182611241565b918901519489019490945294870194925090860190600101611310565b509098975050505050505050565b60006020825261048f6020830184611241565b6000606082526113856060830186611241565b6001600160a01b039490941660208301525060400152919050565b60208082526026908201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6040820152651c8818d85b1b60d21b606082015260800190565b60208082526016908201527520b1b1b7bab73a103430b99037379039b430b932b99760511b604082015260600190565b6020808252601d908201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604082015260600190565b6020808252602a908201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6040820152691bdd081cdd58d8d9595960b21b606082015260800190565b6020808252601b908201527f4163636f756e74206973206e6f7420647565207061796d656e742e0000000000604082015260600190565b60006020825282516020830152602083015160018060a01b03808216604085015280604086015116606085015250506060830151608080840152610d0160a0840182611241565b90815260200190565b6000858252608060208301526115376080830186611241565b6040830194909452506060015292915050565b60405181810167ffffffffffffffff8111828210171561156c5761156c61168b565b604052919050565b600067ffffffffffffffff82111561158e5761158e61168b565b50601f01601f191660200190565b600082198211156115af576115af611675565b500190565b6000826115cf57634e487b7160e01b81526012600452602481fd5b500490565b60008160001904831182151516156115ee576115ee611675565b500290565b60008282101561160557611605611675565b500390565b60005b8381101561162557818101518382015260200161160d565b83811115611634576000848401525b50505050565b60028104600182168061164e57607f821691505b6020821081141561166f57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146116b657600080fd5b5056fea26469706673582212208b693649686584785328ac0988675679fae784510f80761188c400b4405e5a7a64736f6c63430008000033a2646970667358221220fd7306b502e97905b54f332606d43377044dd5d59fe0e1202f6839a00fb2bf2c64736f6c63430008000033";

export class PayoutManagerFactory__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PayoutManagerFactory> {
    return super.deploy(overrides || {}) as Promise<PayoutManagerFactory>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): PayoutManagerFactory {
    return super.attach(address) as PayoutManagerFactory;
  }
  connect(signer: Signer): PayoutManagerFactory__factory {
    return super.connect(signer) as PayoutManagerFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PayoutManagerFactoryInterface {
    return new utils.Interface(_abi) as PayoutManagerFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PayoutManagerFactory {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as PayoutManagerFactory;
  }
}
