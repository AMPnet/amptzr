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

interface IAssetInterface extends ethers.utils.Interface {
  functions: {
    "addShareholder(address,uint256)": FunctionFragment;
    "creator()": FunctionFragment;
    "finalize()": FunctionFragment;
    "info()": FunctionFragment;
    "issuer()": FunctionFragment;
    "removeShareholder(address,uint256)": FunctionFragment;
    "setCreator(address)": FunctionFragment;
    "snapshot()": FunctionFragment;
    "state()": FunctionFragment;
    "totalShares()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addShareholder",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "creator", values?: undefined): string;
  encodeFunctionData(functionFragment: "finalize", values?: undefined): string;
  encodeFunctionData(functionFragment: "info", values?: undefined): string;
  encodeFunctionData(functionFragment: "issuer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "removeShareholder",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "setCreator", values: [string]): string;
  encodeFunctionData(functionFragment: "snapshot", values?: undefined): string;
  encodeFunctionData(functionFragment: "state", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalShares",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "addShareholder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "creator", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "finalize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "info", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "issuer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeShareholder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setCreator", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "snapshot", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "state", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalShares",
    data: BytesLike
  ): Result;

  events: {};
}

export class IAsset extends BaseContract {
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

  interface: IAssetInterface;

  functions: {
    addShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    creator(overrides?: CallOverrides): Promise<[string]>;

    finalize(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    info(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    issuer(overrides?: CallOverrides): Promise<[string]>;

    removeShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setCreator(
      newCreator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    snapshot(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    state(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    totalShares(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  addShareholder(
    shareholder: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  creator(overrides?: CallOverrides): Promise<string>;

  finalize(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  info(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  issuer(overrides?: CallOverrides): Promise<string>;

  removeShareholder(
    shareholder: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setCreator(
    newCreator: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  snapshot(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  state(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  totalShares(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    addShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    creator(overrides?: CallOverrides): Promise<string>;

    finalize(overrides?: CallOverrides): Promise<void>;

    info(overrides?: CallOverrides): Promise<string>;

    issuer(overrides?: CallOverrides): Promise<string>;

    removeShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setCreator(newCreator: string, overrides?: CallOverrides): Promise<void>;

    snapshot(overrides?: CallOverrides): Promise<BigNumber>;

    state(overrides?: CallOverrides): Promise<number>;

    totalShares(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    addShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    creator(overrides?: CallOverrides): Promise<BigNumber>;

    finalize(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    info(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    issuer(overrides?: CallOverrides): Promise<BigNumber>;

    removeShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setCreator(
      newCreator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    snapshot(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    state(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    totalShares(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    addShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    creator(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    finalize(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    info(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    issuer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    removeShareholder(
      shareholder: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setCreator(
      newCreator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    snapshot(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    state(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    totalShares(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
