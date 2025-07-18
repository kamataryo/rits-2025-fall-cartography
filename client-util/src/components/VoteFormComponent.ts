import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { webSocketService } from '../services/WebSocketService';
import { VoteUpdateMessage } from '../types/index';

// Chart.js の全コンポーネントを登録
Chart.register(...registerables);

export class VoteFormComponent extends HTMLElement {
  private chart: Chart | null = null;
  private voteKey: string = '';
  private chartCanvas: HTMLCanvasElement | null = null;
  private componentConnected: boolean = false;
  private _shadowRoot: ShadowRoot;
  private form: HTMLFormElement | null = null;

  static get observedAttributes(): string[] {
    return ['vote-key', 'choices', 'freetext'];
  }

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this.render();
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
        // チャートのタイトルを更新
        if (this.chart) {
          this.chart.options.plugins!.title!.text = `結果: ${this.voteKey}`;
          this.chart.update();
        }
      }
    } else if ((name === 'choices' || name === 'freetext') && oldValue !== newValue) {
      if (this.componentConnected) {
        this.updateFormContent();
      }
    }
  }

  private generateFormContent(): string {
    const choices = this.getAttribute('choices');
    const freetext = this.getAttribute('freetext');

    let formContent = '';

    // choices属性が設定されている場合、ラジオボタンを生成
    if (choices && choices.trim()) {
      const choiceList = choices.split(',').map(c => c.trim()).filter(c => c);
      if (choiceList.length > 0) {
        formContent += '<div class="form-group"><div class="radio-group">';

        choiceList.forEach((choice, index) => {
          const choiceId = `choice-${index}`;
          formContent += `
            <div class="radio-item">
              <input type="radio" id="${choiceId}" name="choice" value="${choice}">
              <label for="${choiceId}">${choice}</label>
            </div>
          `;
        });

        formContent += '</div></div>';
      }
    }

    // freetext="on"が設定されている場合、ラジオボタン付きテキスト入力を追加
    if (freetext === 'on') {
      formContent += `
        <div class="form-group free-input-group">
          <div class="radio-item">
            <input type="radio" id="freetext-radio" name="choice" value="">
            <input type="text" id="freetext-input" placeholder="自由記述で入力">
          </div>
        </div>
      `;
    }

    return formContent;
  }

  private updateFormContent(): void {
    if (!this.form) return;

    // 既存のフォーム内容をクリア（submitボタン以外）
    const submitButtonGroup = this.form.querySelector('.form-group:has(button[type="submit"])');
    this.form.innerHTML = '';

    // 動的に生成されたフォーム内容を追加
    const dynamicContent = this.generateFormContent();
    if (dynamicContent) {
      this.form.innerHTML = dynamicContent;
      const freeTextInput = this.form.querySelector<HTMLInputElement>('#freetext-input');
      const radioInput = this.form.querySelector<HTMLInputElement>('#freetext-radio');
      freeTextInput?.addEventListener('focus', (event) => {
        if(radioInput) {
            radioInput.checked = true; // ラジオボタンの値を更新
          }
        })
      freeTextInput?.addEventListener('change', (event) => {
        const text = (event.target as HTMLInputElement).value.trim();
        if(radioInput) {
          radioInput.value = text
        }
      })
    }

    // submitボタンを最後に追加
    const submitGroup = document.createElement('div');
    submitGroup.className = 'form-group';
    submitGroup.innerHTML = '<button type="submit" class="form-submit-group">送信する</button>';
    this.form.appendChild(submitGroup);

    // フォーム送信イベントを再設定
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  private render(): void {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-bottom: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }

        .vote-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .vote-contents {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .vote-form {
          width: calc(50% - 20px);
        }

        .form-group:last-child {
          margin-bottom: 15px;
        }
        .form-submit-group {
          margin-top: 15px;
        }
        .free-input-group:not(:first-child) {
          margin-top: 8px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        input[type="text"], textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        input[type="radio"], input[type="checkbox"] {
          margin-right: 8px;
        }

        .radio-group, .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .radio-item, .checkbox-item {
          display: flex;
          align-items: center;
        }

        button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        button:hover {
          background-color: #0056b3;
        }

        button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .chart-container {
          margin-top: 20px;
          position: relative;
          width: 50%;
          height: 300px;
        }

        canvas {
          max-width: 100%;
          max-height: 100%;
        }

        .vote-message {
          padding: 8px 12px;
          margin: 10px 0;
          border-radius: 4px;
          font-size: 14px;
        }

        .vote-message-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .vote-message-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .connection-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .connection-connected {
          // background-color: #d1ecf1;
          // color: #0c5460;
          // border: 1px solid #bee5eb;
          display: none;
        }

        .connection-disconnected {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      </style>

      <div class="vote-container">
        <div class="connection-status" id="connection-status">接続中...</div>

        <div class="vote-contents">
          <form class="vote-form" id="vote-form">
            <div class="form-submit-group">
              <button type="submit">送信する</button>
            </div>
          </form>

          <div class="chart-container">
            <canvas id="chart"></canvas>
          </div>
        </div>
      </div>
    `;

    this.form = this._shadowRoot.querySelector('#vote-form');
    this.chartCanvas = this._shadowRoot.querySelector('#chart');
  }

  private setupForm(): void {
    if (!this.form) return;

    // 動的フォーム内容を生成
    this.updateFormContent();
  }

  private setupChart(): void {
    if (!this.chartCanvas) return;

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
            // 'rgba(255, 99, 132, 0.8)',
            // 'rgba(255, 205, 86, 0.8)',
            // 'rgba(75, 192, 192, 0.8)',
            // 'rgba(153, 102, 255, 0.8)',
            // 'rgba(255, 159, 64, 0.8)',
            // 'rgba(199, 199, 199, 0.8)',
            // 'rgba(83, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            // 'rgba(255, 99, 132, 1)',
            // 'rgba(255, 205, 86, 1)',
            // 'rgba(75, 192, 192, 1)',
            // 'rgba(153, 102, 255, 1)',
            // 'rgba(255, 159, 64, 1)',
            // 'rgba(199, 199, 199, 1)',
            // 'rgba(83, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          // title: {
          //   display: true,
          //   text: `結果: ${this.voteKey}`
          // },
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
    const statusElement = this._shadowRoot.querySelector('#connection-status');

    if (statusElement) {
      if (state === 'connected') {
        statusElement.textContent = '接続済み';
        statusElement.className = 'connection-status connection-connected';
        // 接続が確立されたら現在の投票結果を要求
        this.requestCurrentVoteResult();
      } else {
        statusElement.textContent = '接続中...';
        statusElement.className = 'connection-status connection-disconnected';
      }
    }
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.voteKey) {
      console.error('Vote key is not set');
      return;
    }

    if (!this.form) return;

    const formData = new FormData(this.form);
    let content = '';

    // ラジオボタンまたはテキスト入力の選択を取得（name="choice"）
    const choiceValue = formData.get('choice') as string;
    if (choiceValue && choiceValue.trim()) {
      content = choiceValue.trim();
    }

    if (!content) {
      alert('投票内容を入力または選択してください');
      return;
    }

    // WebSocket経由で投票を送信
    webSocketService.sendVote(this.voteKey, content);

    // フォームをリセット
    this.form.reset();

    // 送信完了メッセージ
    // this.showMessage('送信しました', 'success');
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
    const existingMessage = this._shadowRoot.querySelector('.vote-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // メッセージ要素を作成
    const messageElement = document.createElement('div');
    messageElement.className = `vote-message vote-message-${type}`;
    messageElement.textContent = text;

    // フォームの前に挿入
    const form = this._shadowRoot.querySelector('.vote-form');
    if (form && form.parentNode) {
      form.parentNode.insertBefore(messageElement, form);
    }

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
  }
}

// カスタム要素として登録（Autonomous Custom Elements）
customElements.define('vote-form', VoteFormComponent);
