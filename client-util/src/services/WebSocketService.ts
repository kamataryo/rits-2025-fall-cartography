import {
  WebSocketState,
  VoteMessage,
  VoteUpdateMessage,
  WebSocketServiceEvents
} from '../types/index';

// @ts-ignore
if(!window.__webSocketUrl) {
// @ts-ignore
  window.__webSocketUrl = 'wss://2d40ttkm6e.execute-api.ap-northeast-1.amazonaws.com/v1';
}

export class WebSocketService extends EventTarget {
  private ws: WebSocket | null = null;
  private url: string;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1秒

  // スロットリング関連
  private readonly UPDATE_THROTTLE = 500; // 500ms
  private lastUpdateTime = 0;
  private pendingUpdate: VoteUpdateMessage | null = null;
  private updateTimer: number | null = null;

  constructor() {
    super();
    // WebSocket URLを自動検出
    // @ts-ignore
    this.url = window.__webSocketUrl;
  }

  public setUrl(url: string): void {
    this.url = url;
  }

  public connect(): void {
    if (this.state === WebSocketState.CONNECTING || this.state === WebSocketState.CONNECTED) {
      return;
    }

    this.setState(WebSocketState.CONNECTING);

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.setState(WebSocketState.ERROR);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState(WebSocketState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  public sendVote(voteKey: string, content: string): void {
    if (this.state !== WebSocketState.CONNECTED || !this.ws) {
      console.warn('WebSocket not connected. Cannot send vote.');
      return;
    }

    const message: VoteMessage = {
      action: 'vote',
      type: 'VOTE',
      data: {
        key: voteKey,
        content: content
      }
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send vote:', error);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  }

  public getState(): WebSocketState {
    return this.state;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.setState(WebSocketState.CONNECTED);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.setState(WebSocketState.DISCONNECTED);

      // 異常終了の場合は再接続を試行
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.setState(WebSocketState.ERROR);
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    };
  }

  private handleMessage(message: any): void {
    if (message.type === 'VOTE_UPDATE') {
      this.handleVoteUpdate(message as VoteUpdateMessage);
    }
  }

  private handleVoteUpdate(message: VoteUpdateMessage): void {
    const now = Date.now();

    // 最新のメッセージを保持
    this.pendingUpdate = message;

    // 既にタイマーが設定されている場合は何もしない
    if (this.updateTimer) {
      return;
    }

    // 前回更新から十分時間が経っている場合は即座に更新
    if (now - this.lastUpdateTime >= this.UPDATE_THROTTLE) {
      this.applyUpdate();
      return;
    }

    // そうでなければタイマーを設定
    const delay = this.UPDATE_THROTTLE - (now - this.lastUpdateTime);
    this.updateTimer = window.setTimeout(() => {
      this.applyUpdate();
    }, delay);
  }

  private applyUpdate(): void {
    if (this.pendingUpdate) {
      // 実際の更新処理
      this.dispatchEvent(new CustomEvent('vote-update', { detail: this.pendingUpdate }));
      this.lastUpdateTime = Date.now();
      this.pendingUpdate = null;
    }
    this.updateTimer = null;
  }

  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.dispatchEvent(new CustomEvent('connection-state-changed', { detail: newState }));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数バックオフ

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// シングルトンインスタンス
export const webSocketService = new WebSocketService();
