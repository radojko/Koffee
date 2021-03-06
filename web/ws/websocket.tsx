import WSocket, { OpenEvent, MessageEvent } from 'isomorphic-ws';

/**
 * WebSocketComponent indicates that the class will be used as a Controller for the Websockets of the application.
 * Will control what the app receives and will change the state according to it.
 */
export class WebSocketComponent {}

export type TWebSocket = WSocket;
// init;x

export interface IMessage {
  data: any;
  type: string;
  token?: string;
}

type HandlerOpen = (socket: TWebSocket, event: OpenEvent) => void;

type Handler = (
  socket: TWebSocket,
  message: MessageEvent,
  messageParsed: IMessage
) => void;

interface IMapWS {
  [route: string]: Handler;
}

export class WS {
  private _handlers: IMapWS;
  private _handlersOnOpen: Array<HandlerOpen>;
  // todo(GABI): This will change
  private _url: string = `wss://echo.websocket.org`;
  private static _instance: WS;

  private _ws: TWebSocket;

  public constructor() {
    console.log('xd');
    if (WS._instance != null) {
      return;
    }
    WS._instance = this;
    this._handlers = {};
    this._handlersOnOpen = [];

    this._ws = new WSocket(this._url);
    this._ws.onopen = this.onopen.bind(this);
    this._ws.onmessage = this.onmessage.bind(this);
  }

  /**
   * Public methods
   */

  public addHandler(route: string, func: any) {
    this._handlers[route] = func;
  }

  public addHandlerOpen(func: any) {
    this._handlersOnOpen.push(func);
  }

  public static send(message: any, type: string) {
    const msg: Object = {
      data: message,
      type /** authentication, type... etc */
    };
    this._instance._ws.send(JSON.stringify(msg));
  }

  /**
   * Private methods
   */

  private onmessage(message: MessageEvent) {
    const obj = JSON.parse(message.data.toString());
    const messageParsed: IMessage = { type: obj['type'], data: obj['data'] };
    // type: chat.log
    // "{ type: 'chatmsg', data: ... }"
    if (this._handlers && this._handlers[messageParsed.type] != null) {
      this._handlers[messageParsed.type](this._ws, message, messageParsed);
    }
  }

  private onopen(s: OpenEvent) {
    WS.send('xd', 'chat.message');
    this._handlersOnOpen.forEach(handler => {
      handler(this._ws, s);
    });
  }
}

const ws = new WS();

export function HandlerOnMessage(route: string) {
  const fn = (_: any, __: string, descriptor: PropertyDescriptor) => {
    ws.addHandler(route, descriptor.value);
  };
  return fn;
}

export function HandlerOnOpen() {
  const fn = (_: any, __: string, descriptor: PropertyDescriptor) => {
    ws.addHandlerOpen(descriptor.value);
  };
  return fn;
}
