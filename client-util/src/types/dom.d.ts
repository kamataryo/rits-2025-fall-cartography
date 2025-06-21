// DOM型定義の補完
declare global {
  interface Window {
    customElements: CustomElementRegistry;
    webSocketService: any;
    VoteClient: any;
    location: Location;
    setTimeout: (callback: () => void, delay: number) => number;
  }

  interface Document {
    createElement(tagName: string): HTMLElement;
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
  }

  export interface HTMLElement {
    attachShadow(init: ShadowRootInit): ShadowRoot;
    getAttribute(name: string): string | null;
    shadowRoot: ShadowRoot | null;
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    innerHTML: string;
    textContent: string | null;
    className: string;
    style: CSSStyleDeclaration;
    value: string;
    checked: boolean;
    disabled: boolean;
    focus(): void;
  }

  interface ShadowRoot {
    innerHTML: string;
    appendChild(node: Node): Node;
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
  }

  interface CustomElementRegistry {
    define(name: string, constructor: CustomElementConstructor): void;
  }

  interface EventTarget {
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    dispatchEvent(event: Event): boolean;
  }

  interface Event {
    detail?: any;
    key?: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    data?: any;
    code?: number;
    reason?: string;
  }

  interface CustomEvent<T = any> extends Event {
    detail: T;
    initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: T): void;
  }

  interface MessageEvent extends Event {
    data: any;
  }

  interface CloseEvent extends Event {
    code: number;
    reason: string;
  }

  interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  }

  interface Console {
    log(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
  }

  interface JSON {
    parse(text: string): any;
    stringify(value: any): string;
  }

  interface Math {
    max(...values: number[]): number;
    floor(x: number): number;
    pow(x: number, y: number): number;
  }

  interface Date {
    now(): number;
    toISOString(): string;
    toLocaleString(): string;
  }

  interface DateConstructor {
    new (): Date;
    now(): number;
  }

  interface Array<T> {
    from<U>(arrayLike: ArrayLike<U>): U[];
    filter(predicate: (value: T, index: number, array: T[]) => boolean): T[];
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
    join(separator?: string): string;
    sort(compareFn?: (a: T, b: T) => number): T[];
    some(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
  }

  interface Object {
    entries<T>(o: { [s: string]: T }): [string, T][];
    values<T>(o: { [s: string]: T }): T[];
  }

  interface SetConstructor {
    new <T>(): Set<T>;
  }

  interface Set<T> {
    add(value: T): this;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void): void;
    has(value: T): boolean;
    size: number;
  }

  interface WebSocket {
    new (url: string): WebSocket;
    send(data: string): void;
    close(): void;
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
  }

  interface WebSocketConstructor {
    new (url: string): WebSocket;
  }

  interface Location {
    protocol: string;
    host: string;
  }

  // グローバル変数
  var window: Window;
  var document: Document;
  var localStorage: Storage;
  var console: Console;
  var JSON: JSON;
  var Math: Math;
  var Date: DateConstructor;
  var Array: ArrayConstructor;
  var Object: ObjectConstructor;
  var Set: SetConstructor;
  var WebSocket: WebSocketConstructor;
  var customElements: CustomElementRegistry;
  var setTimeout: (callback: () => void, delay: number) => number;
}

export {};
