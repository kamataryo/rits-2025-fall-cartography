import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { webSocketService } from '../services/WebSocketService';
import { VoteUpdateMessage } from '../types/index';

// Chart.js の全コンポーネントを登録
Chart.register(...registerables);

export class VoteFormComponent extends HTMLFormElement {
  private chart: Chart | null = null;
  private voteKey: string = '';
  private chartCanvas: HTMLCanvasElement | null = null;
  private componentConnected: boolean = false;

  static get observedAttributes(): string[] {
    return ['vote-key'];
  }

  constructor() {
    super();
  }

  connectedCallback(): void {
    this.componentConnected = true;
    this.voteKey = this.getAttribute('vote-key') || '';

    if (!this.voteKey) {
      console.error('VoteFormComponent: vote-key attribute is required');
      return;
    }

    this.setupForm();
    this.setupChart();
    this.setupWebSocket();
  }

  disconnectedCallback(): void {
    this.componentConnected = false;
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'vote-key' && oldValue !== newValue) {
      this.voteKey = newValue;
      if (this.componentConnected) {
        this.requestCurrentVoteResult();
      }
    }
  }

  private setupForm(): void {
    // フォーム送信イベントをリッスン
    this.addEventListener('submit', this.handleSubmit.bind(this));

    // スタイルを追加
    this.style.display = 'block';
    this.style.marginBottom = '20px';
  }

  private setupChart(): void {
    alert(1)
    // 既存のcanvas要素を検索
    this.chartCanvas = this.querySelector('canvas');

    // canvas要素が見つからない場合は作成
    if (!this.chartCanvas) {
      this.chartCanvas = document.createElement('canvas');
      this.chartCanvas.id = `chart-${this.voteKey}`;
      this.chartCanvas.style.maxWidth = '100%';
      this.chartCanvas.style.maxHeight = '400px';
      this.appendChild(this.chartCanvas);
    }

    this.createChart();
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: '投票数',
          data: [],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `投票結果: ${this.voteKey}`
          },
          legend: {
            display: false
          }
        },
        animation: {
          duration: 500
        }
      }
    };

    try {
      this.chart = new Chart(this.chartCanvas, config);
    } catch (error) {
      console.error('Chart creation failed:', error);
    }
  }

  private setupWebSocket(): void {
    // WebSocket接続状態の監視
    webSocketService.addEventListener('connection-state-changed', (event: Event) => {
      this.handleConnectionStateChange(event as CustomEvent);
    });

    // 投票結果更新の監視
    webSocketService.addEventListener('vote-update', (event: Event) => {
      this.handleVoteUpdate(event as CustomEvent);
    });

    // WebSocket接続を開始
    webSocketService.connect();

    // 現在の投票結果を要求
    this.requestCurrentVoteResult();
  }

  private handleConnectionStateChange(event: CustomEvent): void {
    const state = event.detail;
    if (state === 'connected') {
      // 接続が確立されたら現在の投票結果を要求
      this.requestCurrentVoteResult();
    }
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.voteKey) {
      console.error('Vote key is not set');
      return;
    }

    const formData = new FormData(this);
    let content = '';

    // 自由テキスト入力を取得
    const textInput = formData.get('content') as string;
    if (textInput && textInput.trim()) {
      content = textInput.trim();
    }

    // ラジオボタンの選択を取得
    const radioValue = formData.get('choice') as string;
    if (radioValue) {
      content = radioValue;
    }

    // チェックボックスの選択を取得（複数選択の場合）
    const checkboxValues = formData.getAll('choices') as string[];
    if (checkboxValues.length > 0) {
      content = checkboxValues.join(', ');
    }

    if (!content) {
      alert('投票内容を入力または選択してください');
      return;
    }

    // WebSocket経由で投票を送信
    webSocketService.sendVote(this.voteKey, content);

    // フォームをリセット
    this.reset();

    // 送信完了メッセージ
    this.showMessage('投票を送信しました', 'success');
  }

  private handleVoteUpdate(event: CustomEvent): void {
    const message = event.detail as VoteUpdateMessage;

    if (message.data.key === this.voteKey) {
      this.updateChart(message.data.summary);
    }
  }

  private updateChart(summary: Record<string, number>): void {
    if (!this.chart) return;

    const labels = Object.keys(summary);
    const data = Object.values(summary);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;

    // チャートを更新
    this.chart.update('active');
  }

  private requestCurrentVoteResult(): void {
    if (webSocketService.getState() === 'connected' && this.voteKey) {
      // 少し遅延を入れて確実に接続が完了してから要求
      setTimeout(() => {
        webSocketService.requestVoteResult(this.voteKey);
      }, 100);
    }
  }

  private showMessage(text: string, type: 'success' | 'error' = 'success'): void {
    // 既存のメッセージを削除
    const existingMessage = this.querySelector('.vote-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // メッセージ要素を作成
    const messageElement = document.createElement('div');
    messageElement.className = `vote-message vote-message-${type}`;
    messageElement.textContent = text;
    messageElement.style.cssText = `
      padding: 8px 12px;
      margin: 10px 0;
      border-radius: 4px;
      font-size: 14px;
      ${type === 'success'
        ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
        : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `;

    // フォームの最初に挿入
    this.insertBefore(messageElement, this.firstChild);

    // 3秒後に自動削除
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 3000);
  }

  private cleanup(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // イベントリスナーを削除（実際の削除は困難なため、コンポーネントの状態で制御）
    // webSocketService.removeEventListener('connection-state-changed', this.handleConnectionStateChange.bind(this));
    // webSocketService.removeEventListener('vote-update', this.handleVoteUpdate.bind(this));
  }
}

// カスタム要素として登録
customElements.define('vote-form', VoteFormComponent, { extends: 'form' });
