/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface CfManagerSoftcapFactoryInterface extends ethers.utils.Interface {
  functions: {
    "create(address,address,uint256,uint256,bool,string)": FunctionFragment;
    "getInstances()": FunctionFragment;
    "getInstancesForAsset(address)": FunctionFragment;
    "getInstancesForIssuer(address)": FunctionFragment;
    "instances(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "create",
    values: [string, string, BigNumberish, BigNumberish, boolean, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getInstances",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getInstancesForAsset",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getInstancesForIssuer",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "instances",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "create", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getInstances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInstancesForAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInstancesForIssuer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "instances", data: BytesLike): Result;

  events: {
    "CfManagerSoftcapCreated(address,address,uint256,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CfManagerSoftcapCreated"): EventFragment;
}

export class CfManagerSoftcapFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: CfManagerSoftcapFactoryInterface;

  functions: {
    create(
      owner: string,
      assetAddress: string,
      initialPricePerToken: BigNumberish,
      softCap: BigNumberish,
      whitelistRequired: boolean,
      info: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getInstances(overrides?: CallOverrides): Promise<[string[]]>;

    getInstancesForAsset(
      asset: string,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getInstancesForIssuer(
      issuer: string,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    instances(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;
  };

  create(
    owner: string,
    assetAddress: string,
    initialPricePerToken: BigNumberish,
    softCap: BigNumberish,
    whitelistRequired: boolean,
    info: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getInstances(overrides?: CallOverrides): Promise<string[]>;

  getInstancesForAsset(
    asset: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getInstancesForIssuer(
    issuer: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  instances(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    create(
      owner: string,
      assetAddress: string,
      initialPricePerToken: BigNumberish,
      softCap: BigNumberish,
      whitelistRequired: boolean,
      info: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getInstances(overrides?: CallOverrides): Promise<string[]>;

    getInstancesForAsset(
      asset: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getInstancesForIssuer(
      issuer: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    instances(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    CfManagerSoftcapCreated(
      creator?: string | null,
      cfManager?: null,
      id?: null,
      asset?: null,
      timestamp?: null
    ): TypedEventFilter<
      [string, string, BigNumber, string, BigNumber],
      {
        creator: string;
        cfManager: string;
        id: BigNumber;
        asset: string;
        timestamp: BigNumber;
      }
    >;
  };

  estimateGas: {
    create(
      owner: string,
      assetAddress: string,
      initialPricePerToken: BigNumberish,
      softCap: BigNumberish,
      whitelistRequired: boolean,
      info: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getInstances(overrides?: CallOverrides): Promise<BigNumber>;

    getInstancesForAsset(
      asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInstancesForIssuer(
      issuer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    instances(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    create(
      owner: string,
      assetAddress: string,
      initialPricePerToken: BigNumberish,
      softCap: BigNumberish,
      whitelistRequired: boolean,
      info: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getInstances(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getInstancesForAsset(
      asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInstancesForIssuer(
      issuer: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    instances(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
