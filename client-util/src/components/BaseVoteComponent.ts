import {
  VoteComponentState,
  WebSocketState,
  VoteUpdateMessage,
  BaseVoteComponentProps
} from '../types/index';
import { webSocketService } from '../services/WebSocketService';


export abstract class BaseVoteComponent extends HTMLElement {
  protected voteKey: string = '';
  protected options: string[] = [];
  protected state: VoteComponentState = VoteComponentState.CONNECTING;
  protected hasVoted: boolean = false;
  protected voteResults: VoteUpdateMessage | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.parseAttributes();
    this.setupWebSocket();
    this.loadVoteState();
    this.render();
  }

  disconnectedCallback(): void {
    this.cleanupWebSocket();
  }

  private parseAttributes(): void {
    this.voteKey = this.getAttribute('vote-key') || '';
    const optionsAttr = this.getAttribute('options');

    if (optionsAttr) {
      try {
        this.options = JSON.parse(optionsAttr);
      } catch (error) {
        console.error('Invalid options JSON:', optionsAttr);
        this.options = [];
      }
    } else {
      this.options = [];
    }

    if (!this.voteKey) {
      console.error('vote-key attribute is required');
      this.setState(VoteComponentState.ERROR);
    }
  }

  private setupWebSocket(): void {
    // WebSocket接続状態の監視
    webSocketService.addEventListener('connection-state-changed', this.handleConnectionStateChange.bind(this));

    // 投票結果の監視
    webSocketService.addEventListener('vote-update', this.handleVoteUpdate.bind(this));

    // 接続開始
    webSocketService.connect();
  }

  private cleanupWebSocket(): void {
    webSocketService.removeEventListener('connection-state-changed', this.handleConnectionStateChange.bind(this));
    webSocketService.removeEventListener('vote-update', this.handleVoteUpdate.bind(this));
  }

  private handleConnectionStateChange(event: Event): void {
    const customEvent = event as CustomEvent;
    const wsState = customEvent.detail as WebSocketState;

    switch (wsState) {
      case WebSocketState.CONNECTING:
        this.setState(VoteComponentState.CONNECTING);
        break;
      case WebSocketState.CONNECTED:
        if (!this.hasVoted) {
          this.setState(VoteComponentState.READY);
        }
        break;
      case WebSocketState.DISCONNECTED:
      case WebSocketState.ERROR:
        this.setState(VoteComponentState.ERROR);
        break;
    }
  }

  private handleVoteUpdate(event: Event): void {
    const customEvent = event as CustomEvent;
    const voteUpdate = customEvent.detail as VoteUpdateMessage;

    if (voteUpdate.data.key === this.voteKey) {
      this.voteResults = voteUpdate;
      this.render();
    }
  }

  protected setState(newState: VoteComponentState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.render();
    }
  }

  protected sendVote(content: string): void {
    if (webSocketService.getState() !== WebSocketState.CONNECTED) {
      console.warn('WebSocket not connected');
      return;
    }

    this.setState(VoteComponentState.VOTING);
    webSocketService.sendVote(this.voteKey, content);

    // 投票状態を保存
    this.saveVoteState(content);
    this.hasVoted = true;
    this.setState(VoteComponentState.VOTED);
  }

  private loadVoteState(): void {
    try {
      const stored = localStorage.getItem(`vote-${this.voteKey}`);
      if (stored) {
        const voteRecord = JSON.parse(stored);
        this.hasVoted = true;
        this.setState(VoteComponentState.VOTED);
      }
    } catch (error) {
      console.error('Failed to load vote state:', error);
    }
  }

  private saveVoteState(content: string): void {
    try {
      const voteRecord = {
        voteKey: this.voteKey,
        content: [content],
        timestamp: Date.now()
      };
      localStorage.setItem(`vote-${this.voteKey}`, JSON.stringify(voteRecord));
    } catch (error) {
      console.error('Failed to save vote state:', error);
    }
  }

  protected render(): void {
    if (!this.shadowRoot) return;

    const container = document.createElement('div');
    container.className = 'vote-container';

    // 状態に応じた表示
    switch (this.state) {
      case VoteComponentState.CONNECTING:
        container.innerHTML = this.renderConnecting();
        break;
      case VoteComponentState.READY:
        container.innerHTML = this.renderVoteForm();
        break;
      case VoteComponentState.VOTING:
        container.innerHTML = this.renderVoting();
        break;
      case VoteComponentState.VOTED:
        container.innerHTML = this.renderResults();
        break;
      case VoteComponentState.ERROR:
        container.innerHTML = this.renderError();
        break;
    }

    // スタイルを追加
    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    // イベントリスナーを設定
    this.setupEventListeners();
  }

  protected renderConnecting(): string {
    return `
      <div class="status connecting">
        <span class="spinner"></span>
        接続中...
      </div>
    `;
  }

  protected renderVoting(): string {
    return `
      <div class="status voting">
        <span class="spinner"></span>
        投票中...
      </div>
    `;
  }

  protected renderError(): string {
    return `
      <div class="status error">
        ❌ 接続エラーが発生しました
      </div>
    `;
  }

  protected renderResults(): string {
    if (!this.voteResults) {
      return `
        <div class="results">
          <h3>投票完了</h3>
          <p>結果を集計中...</p>
        </div>
      `;
    }

    const { summary, totalCount } = this.voteResults.data;
    const maxCount = Math.max(...Object.values(summary));

    const resultsHtml = Object.entries(summary)
      .sort(([,a], [,b]) => b - a)
      .map(([content, count]) => {
        const percentage = totalCount > 0 ? (count / totalCount * 100) : 0;
        const barWidth = maxCount > 0 ? (count / maxCount * 100) : 0;

        return `
          <div class="result-item">
            <div class="result-label">${this.escapeHtml(content)}</div>
            <div class="result-bar">
              <div class="result-fill" style="width: ${barWidth}%"></div>
              <span class="result-count">${count}票 (${percentage.toFixed(1)}%)</span>
            </div>
          </div>
        `;
      }).join('');

    return `
      <div class="results">
        <h3>投票結果 (総投票数: ${totalCount})</h3>
        <div class="results-list">
          ${resultsHtml}
        </div>
      </div>
    `;
  }

  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  protected getStyles(): string {
    return `
      .vote-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fff;
      }

      .status {
        text-align: center;
        padding: 20px;
        font-size: 16px;
      }

      .status.connecting, .status.voting {
        color: #666;
      }

      .status.error {
        color: #d32f2f;
        background: #ffebee;
        border-radius: 4px;
      }

      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #666;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .results {
        margin-top: 20px;
      }

      .results h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: #333;
      }

      .results-list {
        space-y: 12px;
      }

      .result-item {
        margin-bottom: 12px;
      }

      .result-label {
        font-weight: 500;
        margin-bottom: 4px;
        color: #333;
      }

      .result-bar {
        position: relative;
        background: #f5f5f5;
        border-radius: 4px;
        height: 32px;
        overflow: hidden;
      }

      .result-fill {
        background: #2196f3;
        height: 100%;
        transition: width 0.3s ease;
      }

      .result-count {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }

      button {
        background: #2196f3;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      button:hover {
        background: #1976d2;
      }

      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      input[type="radio"], input[type="checkbox"] {
        margin-right: 8px;
      }

      textarea {
        width: 100%;
        min-height: 80px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .options-list {
        space-y: 8px;
      }

      .option-item {
        margin-bottom: 8px;
      }
    `;
  }

  // 抽象メソッド - 各コンポーネントで実装
  protected abstract renderVoteForm(): string;
  protected abstract setupEventListeners(): void;
}
