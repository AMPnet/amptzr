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

interface IPayoutManagerInterface extends ethers.utils.Interface {
  functions: {
    "getInfoHistory()": FunctionFragment;
    "getState()": FunctionFragment;
    "release(address,uint256)": FunctionFragment;
    "released(address,uint256)": FunctionFragment;
    "setInfo(string)": FunctionFragment;
    "shares(address,uint256)": FunctionFragment;
    "totalReleased(uint256)": FunctionFragment;
    "totalShares()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getInfoHistory",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getState", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "release",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "released",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "setInfo", values: [string]): string;
  encodeFunctionData(
    functionFragment: "shares",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalReleased",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalShares",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "getInfoHistory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getState", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "release", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "released", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setInfo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "shares", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalReleased",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalShares",
    data: BytesLike
  ): Result;

  events: {};
}

export class IPayoutManager extends BaseContract {
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

  interface: IPayoutManagerInterface;

  functions: {
    getInfoHistory(
      overrides?: CallOverrides
    ): Promise<
      [([string, BigNumber] & { info: string; timestamp: BigNumber })[]]
    >;

    getState(
      overrides?: CallOverrides
    ): Promise<
      [
        [BigNumber, string, string, string] & {
          id: BigNumber;
          owner: string;
          asset: string;
          info: string;
        }
      ]
    >;

    release(
      account: string,
      snapshotId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    released(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    setInfo(
      info: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    shares(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    totalReleased(
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    totalShares(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  getInfoHistory(
    overrides?: CallOverrides
  ): Promise<([string, BigNumber] & { info: string; timestamp: BigNumber })[]>;

  getState(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, string, string, string] & {
      id: BigNumber;
      owner: string;
      asset: string;
      info: string;
    }
  >;

  release(
    account: string,
    snapshotId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  released(
    account: string,
    snapshotId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  setInfo(
    info: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  shares(
    account: string,
    snapshotId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  totalReleased(
    snapshotId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  totalShares(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    getInfoHistory(
      overrides?: CallOverrides
    ): Promise<
      ([string, BigNumber] & { info: string; timestamp: BigNumber })[]
    >;

    getState(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string, string] & {
        id: BigNumber;
        owner: string;
        asset: string;
        info: string;
      }
    >;

    release(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    released(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setInfo(info: string, overrides?: CallOverrides): Promise<void>;

    shares(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalReleased(
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalShares(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    getInfoHistory(overrides?: CallOverrides): Promise<BigNumber>;

    getState(overrides?: CallOverrides): Promise<BigNumber>;

    release(
      account: string,
      snapshotId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    released(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setInfo(
      info: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    shares(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalReleased(
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalShares(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    getInfoHistory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getState(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    release(
      account: string,
      snapshotId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    released(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setInfo(
      info: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    shares(
      account: string,
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalReleased(
      snapshotId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalShares(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
