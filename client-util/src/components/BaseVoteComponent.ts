import {
  VoteComponentState,
  WebSocketState,
  VoteUpdateMessage,
  BaseVoteComponentProps
} from '../types/index';
import { webSocketService } from '../services/WebSocketService';
import Chart from 'chart.js/auto';


export abstract class BaseVoteComponent extends HTMLElement {
  protected voteKey: string = '';
  protected options: string[] = [];
  protected state: VoteComponentState = VoteComponentState.CONNECTING;
  protected voteIds: string[] = [];  // hasVoted から変更
  protected voteResults: VoteUpdateMessage | null = null;
  protected chartType: 'bar' | 'pie' = 'bar';
  protected chart: Chart | null = null;

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
    const chartTypeAttr = this.getAttribute('chart-type') || 'bar';

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

    // chart-type属性の検証
    if (chartTypeAttr !== 'bar' && chartTypeAttr !== 'pie') {
      throw new Error(`Invalid chart-type: ${chartTypeAttr}. Must be 'bar' or 'pie'.`);
    }
    this.chartType = chartTypeAttr as 'bar' | 'pie';

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
        this.setState(VoteComponentState.READY);
        // 投票済みの場合、結果を要求
        if (this.voteIds.length > 0) {
          this.requestVoteResult();
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

      // userVoteId が返された場合は保存
      if (voteUpdate.data.userVoteId) {
        this.voteIds = [voteUpdate.data.userVoteId];
        this.saveVoteState(this.voteIds);
      }

      // 結果セクションが既に存在するかチェック
      const existingResults = this.shadowRoot?.querySelector('.results');

      if (existingResults) {
        // 既存の結果セクションがある場合は、結果部分のみ更新
        this.updateResultsDisplay();
        setTimeout(() => this.renderChart(), 0);
      } else {
        // 結果セクションがない場合は動的に追加
        this.addResultsSection();
      }
    }
  }
  // 結果セクションを動的に追加するメソッド
  private addResultsSection(): void {
    if (!this.shadowRoot || !this.voteResults) return;

    const container = this.shadowRoot.querySelector('.vote-container');
    if (!container) return;

    // 区切り線と結果セクションを追加
    const resultsHtml = `
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <div class="results">
        <h3>投票結果 (総投票数: ${this.voteResults.data.totalCount})</h3>
        <div class="chart-container">
          <canvas id="vote-chart" width="400" height="300"></canvas>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', resultsHtml);

    // チャートを描画
    setTimeout(() => this.renderChart(), 0);
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

    // 単一投票の場合、既存のvoteIdを使用
    const existingVoteId = this.voteIds[0] || undefined;
    webSocketService.sendVote(this.voteKey, content, existingVoteId);
  }

  private loadVoteState(): void {
    try {
      const stored = localStorage.getItem(`vote-${this.voteKey}`);
      if (stored) {
        const voteRecord = JSON.parse(stored);
        this.voteIds = voteRecord.voteIds || [];
      }
    } catch (error) {
      console.error('Failed to load vote state:', error);
    }
  }

  private saveVoteState(voteIds: string[]): void {
    try {
      const voteRecord = {
        voteKey: this.voteKey,
        voteIds: voteIds,
        timestamp: Date.now()
      };
      localStorage.setItem(`vote-${this.voteKey}`, JSON.stringify(voteRecord));
    } catch (error) {
      console.error('Failed to save vote state:', error);
    }
  }

  private requestVoteResult(): void {
    if (webSocketService.getState() === WebSocketState.CONNECTED) {
      webSocketService.requestVoteResult(this.voteKey);
    }
  }

  protected updateResultsDisplay(): void {
    if (!this.shadowRoot || !this.voteResults) return;

    const { totalCount } = this.voteResults.data;
    const titleElement = this.shadowRoot.querySelector('.results h3');
    if (titleElement) {
      titleElement.textContent = `投票結果 (総投票数: ${totalCount})`;
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
      case VoteComponentState.VOTING:
        container.innerHTML = this.renderFormAndResults();
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

    // Chart.jsの描画（結果がある場合）
    if (this.voteResults) {
      setTimeout(() => this.renderChart(), 0);
    }
  }
  // 新しいレンダリングメソッド：フォームと結果を同時表示
  protected renderFormAndResults(): string {
    let html = '';

    // 投票中の場合は投票中表示
    if (this.state === VoteComponentState.VOTING) {
      html += `
        <div class="status voting">
          <span class="spinner"></span>
          投票中...
        </div>
      `;
    } else {
      // 通常時は投票フォームを表示
      html += this.renderVoteForm();
    }

    // 投票結果がある場合は結果も表示
    if (this.voteResults) {
      html += `
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <div class="results">
          <h3>投票結果 (総投票数: ${this.voteResults.data.totalCount})</h3>
          <div class="chart-container">
            <canvas id="vote-chart" width="400" height="300"></canvas>
          </div>
        </div>
      `;
    }

    return html;
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

    return `
      <div class="results">
        <h3>投票結果 (総投票数: ${totalCount})</h3>
        <div class="chart-container">
          <canvas id="vote-chart" width="400" height="300"></canvas>
        </div>
      </div>
    `;
  }

  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private renderChart(): void {
    if (!this.shadowRoot || !this.voteResults) return;

    const canvas = this.shadowRoot.querySelector('#vote-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('Canvas element not found for chart rendering');
      return;
    }

    const { summary } = this.voteResults.data;
    const entries = Object.entries(summary).sort(([,a], [,b]) => b - a);
    const labels = entries.map(([content]) => content);
    const data = entries.map(([,count]) => count);

    // デフォルトの色パレット
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    // 既存のチャートがある場合はデータを更新
    if (this.chart && this.chart.canvas && this.chart.canvas.parentNode) {
      try {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;

        // 色を更新（棒グラフ・パイチャート共通）
        this.chart.data.datasets[0].backgroundColor = this.chartType === 'pie'
          ? colors.slice(0, data.length)
          : colors.slice(0, data.length);
        this.chart.data.datasets[0].borderColor = this.chartType === 'pie'
          ? colors.slice(0, data.length)
          : colors.slice(0, data.length);

        // インクリメンタルアニメーションで更新
        this.chart.update('active');
        return;
      } catch (error) {
        console.warn('Chart update failed, recreating chart:', error);
        // チャートの更新に失敗した場合は破棄して再作成
        this.chart.destroy();
        this.chart = null;
      }
    }

    // 既存のチャートを破棄（canvas要素が変わった場合）
    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (error) {
        console.warn('Chart destroy failed:', error);
      }
      this.chart = null;
    }

    // 初回作成時または再作成時
    const chartConfig: any = {
      type: this.chartType === 'bar' ? 'bar' : 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.chartType === 'pie' ? colors.slice(0, data.length) : colors.slice(0, data.length),
          borderColor: this.chartType === 'pie' ? colors.slice(0, data.length) : colors.slice(0, data.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: this.chartType === 'pie',
            position: 'bottom' as const
          }
        }
      }
    };

    // 棒グラフの場合の追加設定（横向き）
    if (this.chartType === 'bar') {
      chartConfig.type = 'bar';
      chartConfig.options.indexAxis = 'y'; // 横向きにする
      chartConfig.options.scales = {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        y: {
          ticks: {
            maxRotation: 0,
            minRotation: 0
          }
        }
      };
    }

    try {
      this.chart = new Chart(canvas, chartConfig);
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
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

      .chart-container {
        position: relative;
        height: 300px;
        margin-top: 16px;
      }

      #vote-chart {
        max-width: 100%;
        height: auto;
      }
    `;
  }

  // 抽象メソッド - 各コンポーネントで実装
  protected abstract renderVoteForm(): string;
  protected abstract setupEventListeners(): void;
}
