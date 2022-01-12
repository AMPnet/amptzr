import {logger, providers} from 'ethers'
import {Networkish} from '@ethersproject/networks'
import {Logger} from '@ethersproject/logger'
import {defineReadOnly} from '@ethersproject/properties'
import ReconnectingWebSocket from 'reconnecting-websocket'
import {BigNumber} from '@ethersproject/bignumber'

let NextId = 1

/**
 * ReconnectingWebSocketProvider is a custom WebSocketProvider implementation that is able
 * to handle disconnecting issues described here: https://github.com/ethers-io/ethers.js/issues/1053
 * The solution is a direct copy/paste of the official`providers.WebSocketProvider`, but
 * the only thing that is changed is usage of ReconnectingWebSocket as a WebSocket implementation.
 * More precisely, only this line has been changed:
 * ```ts
 *    // from this
 *    defineReadOnly(this, "_websocket", new WebSocket(this.connection.url))
 *
 *    // to this
 *    defineReadOnly(this, "_websocket", new ReconnectingWebSocket(this.connection.url))
 * ```
 *
 * Everything seems to work, but it needs to be a bit more tested.
 */
export class ReconnectingWebsocketProvider extends providers.JsonRpcProvider {
  readonly _websocket: any
  readonly _requests!: { // @ts-ignore
    [name: string]: InflightRequest
  }
  readonly _detectNetwork!: Promise<providers.Network>

  // Maps event tag to subscription ID (we dedupe identical events)
  readonly _subIds!: { [tag: string]: Promise<string> }

  // Maps Subscription ID to Subscription
  readonly _subs!: { // @ts-ignore
    [name: string]: Subscription
  }

  _wsReady: boolean

  constructor(url: string, network?: Networkish) {
    // This will be added in the future; please open an issue to expedite
    if (network === "any") {
      logger.throwError("WebSocketProvider does not support 'any' network yet", Logger.errors.UNSUPPORTED_OPERATION, {
        operation: "network:any",
      })
    }

    super(url, network)
    this._pollingInterval = -1

    this._wsReady = false

    defineReadOnly(this, "_websocket", new ReconnectingWebSocket(this.connection.url))
    defineReadOnly(this, "_requests", {})
    defineReadOnly(this, "_subs", {})
    defineReadOnly(this, "_subIds", {})
    defineReadOnly(this, "_detectNetwork", super.detectNetwork())

    // Stall sending requests until the socket is open...
    this._websocket.onopen = () => {
      this._wsReady = true
      Object.keys(this._requests).forEach((id) => {
        this._websocket.send(this._requests[id].payload)
      })
    }

    this._websocket.onmessage = (messageEvent: { data: string }) => {
      const data = messageEvent.data
      const result = JSON.parse(data)
      if (result.id != null) {
        const id = String(result.id)
        const request = this._requests[id]
        delete this._requests[id]

        if (result.result !== undefined) {
          // @ts-ignore
          request.callback(null, result.result)

          this.emit("debug", {
            action: "response",
            request: JSON.parse(request.payload),
            response: result.result,
            provider: this,
          })

        } else {
          // @ts-ignore
          let error: Error = null
          if (result.error) {
            error = new Error(result.error.message || "unknown error")
            defineReadOnly(<any>error, "code", result.error.code || null)
            defineReadOnly(<any>error, "response", data)
          } else {
            error = new Error("unknown error")
          }

          request.callback(error, undefined)

          this.emit("debug", {
            action: "response",
            error: error,
            request: JSON.parse(request.payload),
            provider: this,
          })

        }

      } else if (result.method === "eth_subscription") {
        // Subscription...
        const sub = this._subs[result.params.subscription]
        if (sub) {
          //this.emit.apply(this,                  );
          sub.processFunc(result.params.result)
        }

      } else {
        console.warn("this should not happen")
      }
    }

    // This Provider does not actually poll, but we want to trigger
    // poll events for things that depend on them (like stalling for
    // block and transaction lookups)
    const fauxPoll = setInterval(() => {
      this.emit("poll")
    }, 1000)
    if (fauxPoll.unref) {
      fauxPoll.unref()
    }
  }

  detectNetwork(): Promise<providers.Network> {
    return this._detectNetwork
  }

  get pollingInterval(): number {
    return 0
  }

  resetEventsBlock(blockNumber: number): void {
    logger.throwError("cannot reset events block on WebSocketProvider", Logger.errors.UNSUPPORTED_OPERATION, {
      operation: "resetEventBlock",
    })
  }

  set pollingInterval(value: number) {
    logger.throwError("cannot set polling interval on WebSocketProvider", Logger.errors.UNSUPPORTED_OPERATION, {
      operation: "setPollingInterval",
    })
  }

  async poll(): Promise<void> {
    // @ts-ignore
    return null
  }

  set polling(value: boolean) {
    if (!value) {
      return
    }

    logger.throwError("cannot set polling on WebSocketProvider", Logger.errors.UNSUPPORTED_OPERATION, {
      operation: "setPolling",
    })
  }

  send(method: string, params?: Array<any>): Promise<any> {
    const rid = NextId++

    return new Promise((resolve, reject) => {
      function callback(error: Error, result: any) {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      }

      const payload = JSON.stringify({
        method: method,
        params: params,
        id: rid,
        jsonrpc: "2.0",
      })

      this.emit("debug", {
        action: "request",
        request: JSON.parse(payload),
        provider: this,
      })

      this._requests[String(rid)] = {callback, payload}

      if (this._wsReady) {
        this._websocket.send(payload)
      }
    })
  }

  static defaultUrl(): string {
    return "ws:/\/localhost:8546"
  }

  async _subscribe(tag: string, param: Array<any>, processFunc: (result: any) => void): Promise<void> {
    let subIdPromise = this._subIds[tag]
    if (subIdPromise == null) {
      subIdPromise = Promise.all(param).then((param) => {
        return this.send("eth_subscribe", param)
      })
      this._subIds[tag] = subIdPromise
    }
    const subId = await subIdPromise
    this._subs[subId] = {tag, processFunc}
  }

  _startEvent(event: any): void {
    switch (event.type) {
      case "block":
        this._subscribe("block", ["newHeads"], (result: any) => {
          const blockNumber = BigNumber.from(result.number).toNumber()
          this._emitted.block = blockNumber
          this.emit("block", blockNumber)
        })
        break

      case "pending":
        this._subscribe("pending", ["newPendingTransactions"], (result: any) => {
          this.emit("pending", result)
        })
        break

      case "filter":
        this._subscribe(event.tag, ["logs", this._getFilter(event.filter)], (result: any) => {
          if (result.removed == null) {
            result.removed = false
          }
          this.emit(event.filter, this.formatter.filterLog(result))
        })
        break

      case "tx": {
        const emitReceipt = (event: any) => {
          const hash = event.hash
          this.getTransactionReceipt(hash).then((receipt) => {
            if (!receipt) {
              return
            }
            this.emit(hash, receipt)
          })
        }

        // In case it is already mined
        emitReceipt(event)

        // To keep things simple, we start up a single newHeads subscription
        // to keep an eye out for transactions we are watching for.
        // Starting a subscription for an event (i.e. "tx") that is already
        // running is (basically) a nop.
        this._subscribe("tx", ["newHeads"], (result: any) => {
          this._events.filter((e) => (e.type === "tx")).forEach(emitReceipt)
        })
        break
      }

      // Nothing is needed
      case "debug":
      case "poll":
      case "willPoll":
      case "didPoll":
      case "error":
        break

      default:
        console.log("unhandled:", event)
        break
    }
  }

  _stopEvent(event: any): void {
    let tag = event.tag

    if (event.type === "tx") {
      // There are remaining transaction event listeners
      if (this._events.filter((e) => (e.type === "tx")).length) {
        return
      }
      tag = "tx"
    } else if (this.listenerCount(event.event)) {
      // There are remaining event listeners
      return
    }

    const subId = this._subIds[tag]
    if (!subId) {
      return
    }

    delete this._subIds[tag]
    subId.then((subId) => {
      if (!this._subs[subId]) {
        return
      }
      delete this._subs[subId]
      this.send("eth_unsubscribe", [subId])
    })
  }

  async destroy(): Promise<void> {
    // Wait until we have connected before trying to disconnect
    if (this._websocket.readyState === WebSocket.CONNECTING) {
      await (new Promise((resolve) => {
        this._websocket.onopen = function () {
          resolve(true)
        }

        this._websocket.onerror = function () {
          resolve(false)
        }
      }))
    }

    // Hangup
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
    this._websocket.close(1000)
  }
}
