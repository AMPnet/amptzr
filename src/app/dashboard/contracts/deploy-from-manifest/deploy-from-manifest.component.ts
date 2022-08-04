import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-deploy-from-manifest',
  templateUrl: './deploy-from-manifest.component.html',
  styleUrls: ['./deploy-from-manifest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeployFromManifestComponent implements OnInit {

  manifest = `{
    "$schema": "../../schema.json",
    "tags": [
        "tokens",
        "finance"
    ],
    "implements": [
        "traits.erc20",
        "traits.erc20metadata"
    ],
    "eventDecorators": [
        {
            "signature": "Transfer(address,address,uint256)",
            "name": "Token transfer",
            "description": "Indicates that ERC20 transfer has occurred.",
            "parameterDecorators": [
                {
                    "name": "Sender address",
                    "description": "Address from which the ERC20 token was sent.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Recipient address",
                    "description": "Address to which the ERC20 token was sent.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Token amount",
                    "description": "The amount of ERC20 token that was send.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ]
        },
        {
            "signature": "Approval(address,address,uint256)",
            "name": "Token spending approval",
            "description": "Indicates that approval to spend ERC20 token has occurred.",
            "parameterDecorators": [
                {
                    "name": "Approver address",
                    "description": "Address of the owner who approved spending of their ERC20 token.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Spender address",
                    "description": "Address for which the owner has approved to spend their ERC20 token.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Approved token amount",
                    "description": "The amount of ERC20 token that was approved for spending.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ]
        }
    ],
    "constructorDecorators": [
        {
            "signature": "constructor(string,string)",
            "name": "Constructor",
            "description": "Deployes the ERC20 token with given token name and symbol.",
            "parameterDecorators": [
                {
                    "name": "Token name",
                    "description": "Name of the token which will be deployed.",
                    "recommendedTypes": [
                        "types.string"
                    ]
                },
                {
                    "name": "Token symbol",
                    "description": "Symbol of the token which will be depoyed.",
                    "recommendedTypes": [
                        "types.string",
                        "types.ticker"
                    ]
                }
            ]
        }
    ],
    "functionDecorators": [
        {
            "signature": "allowance(address,address)",
            "name": "Get allowance",
            "description": "Returns the amount of tokens that the spender is allowed to spend on behalf of the approving owner.",
            "parameterDecorators": [
                {
                    "name": "Approver address",
                    "description": "Address of the owner which approved spending.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Spender address",
                    "description": "Address of the spender.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Approved token amount",
                    "description": "The amount which was approved for spending.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "emittableEvents": []
        },
        {
            "signature": "approve(address,uint256)",
            "name": "Approve token spending",
            "description": "Approves the specified amount for spending for the specified spender address. Transaction sender is implicitly the approving owner.",
            "parameterDecorators": [
                {
                    "name": "Spender address",
                    "description": "Address of the spender for which spending will be approved.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Approved token amount",
                    "description": "The amount to approve for spending.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Operation succeeded",
                    "description": "Indicates whether the operation was successful.",
                    "recommendedTypes": [
                        "types.boolean"
                    ]
                }
            ],
            "emittableEvents": [
                "Approval(address,address,uint256)"
            ]
        },
        {
            "signature": "balanceOf(address)",
            "name": "Get balance",
            "description": "Returns the amount of ERC20 tokens owned by the specified address.",
            "parameterDecorators": [
                {
                    "name": "Account address",
                    "description": "Address of the account for which to check balance.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Token amount",
                    "description": "The amount of the ERC20 tokens owned by the specified address.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "emittableEvents": []
        },
        {
            "signature": "decimals()",
            "name": "Get ERC20 decimals",
            "description": "Returns the number of decimals used by this ERC20 token.",
            "parameterDecorators": [],
            "returnDecorators": [
                {
                    "name": "Decimal places",
                    "description": "Number of decimals used by this ERC20 token.",
                    "recommendedTypes": [
                        "types.amount"
                    ]
                }
            ],
            "emittableEvents": []
        },
        {
            "signature": "decreaseAllowance(address,uint256)",
            "name": "Decrease allowed spending amount",
            "description": "Decrease the approved spending amount for the specified spender address. Transaction sender is implicitly the owner which decreases the approved allowance for the spender.",
            "parameterDecorators": [
                {
                    "name": "Spender address",
                    "description": "Address of the spender for whom the allowed spending amount will be decreased.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Amount to subtract",
                    "description": "The amount which will be subtracted from the current allowed amount to spend.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Operation succeeded",
                    "description": "Indicates whether the operation was successful.",
                    "recommendedTypes": [
                        "types.boolean"
                    ]
                }
            ],
            "emittableEvents": [
                "Approval(address,address,uint256)"
            ]
        },
        {
            "signature": "increaseAllowance(address,uint256)",
            "name": "Increase allowed spending amount",
            "description": "Increases the amount of funds that can be spent by another address.",
            "parameterDecorators": [
                {
                    "name": "Spender address",
                    "description": "Address of the spender for whom the allowed spending amount will be increased.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Amount to add",
                    "description": "The amount which will be added to the current allowed amount to spend.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Operation succeeded",
                    "description": "Indicates whether the operation was successful.",
                    "recommendedTypes": [
                        "types.boolean"
                    ]
                }
            ],
            "emittableEvents": [
                "Approval(address,address,uint256)"
            ]
        },
        {
            "signature": "name()",
            "name": "Get token name",
            "description": "Returns the name of this ERC20 token.",
            "parameterDecorators": [],
            "returnDecorators": [
                {
                    "name": "Token name",
                    "description": "The name of this ERC20 token.",
                    "recommendedTypes": [
                        "types.string"
                    ]
                }
            ],
            "emittableEvents": []
        },
        {
            "signature": "symbol()",
            "name": "Get token symbol",
            "description": "Returns the symbol of this ERC20 token.",
            "parameterDecorators": [],
            "returnDecorators": [
                {
                    "name": "Token symbol",
                    "description": "The symbol of this ERC20 token.",
                    "recommendedTypes": [
                        "types.string",
                        "types.ticker"
                    ]
                }
            ],
            "emittableEvents": []
        },
        {
            "signature": "totalSupply()",
            "name": "Get total token supply",
            "description": "Returns the total supply of this ERC20 token.",
            "parameterDecorators": [],
            "returnDecorators": [
                {
                    "name": "Total token supply",
                    "description": "The total supply of this ERC20 token.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "emittableEvents": []
        },
        {
            "signature": "transfer(address,uint256)",
            "name": "Transfer tokens",
            "description": "Transfers the specified ERC20 token amount to the specified address. Transaction sender is the address from which the tokens will be sent.",
            "parameterDecorators": [
                {
                    "name": "Recipient address",
                    "description": "Address to which the ERC20 tokens will be sent.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Token amount",
                    "description": "The amount of ERC20 tokens to send.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Operation succeeded",
                    "description": "Indicates whether the operation was successful.",
                    "recommendedTypes": [
                        "types.boolean"
                    ]
                }
            ],
            "emittableEvents": [
                "Transfer(address,address,uint256)"
            ]
        },
        {
            "signature": "transferFrom(address,address,uint256)",
            "name": "Transfer approved tokens",
            "description": "Transfers the specified ERC20 token amount from one address to another. The ERC20 tokens must be approved for spending by the source address for the transaction sender.",
            "parameterDecorators": [
                {
                    "name": "Sender address",
                    "description": "Source address from which the ERC20 tokens will be sent. Must have approved spending of ERC20 tokens by the transaction sender.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Recipient address",
                    "description": "Address to which the ERC20 tokens will be sent.",
                    "recommendedTypes": [
                        "types.walletAddress"
                    ]
                },
                {
                    "name": "Token amount",
                    "description": "The amount of ERC20 tokens to send.",
                    "recommendedTypes": [
                        "types.amountWithPrecision"
                    ]
                }
            ],
            "returnDecorators": [
                {
                    "name": "Operation succeeded",
                    "description": "Indicates whether the operation was successful.",
                    "recommendedTypes": [
                        "types.boolean"
                    ]
                }
            ],
            "emittableEvents": [
                "Transfer(address,address,uint256)",
                "Approval(address,address,uint256)"
            ]
        }
    ]
}`

  constructor() { }

  ngOnInit(): void {

    let objMan = JSON.parse(this.manifest)

  }

}
