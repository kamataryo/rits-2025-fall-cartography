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
  private submitButton: HTMLButtonElement | null = null;

  static get observedAttributes(): string[] {
    return ['vote-key', 'choices', 'freetext', 'view'];
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
    } else if (name === 'view' && oldValue !== newValue) {
      if (this.componentConnected) {
        this.recreateDisplayContainer();
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

      // ラジオボタンにchangeイベントリスナーを追加
      const radioButtons = this.form.querySelectorAll<HTMLInputElement>('input[type="radio"][name="choice"]');
      radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
          this.updateSubmitButtonState();
        });
      });

      const freeTextInput = this.form.querySelector<HTMLInputElement>('#freetext-input');
      const radioInput = this.form.querySelector<HTMLInputElement>('#freetext-radio');
      freeTextInput?.addEventListener('focus', (event) => {
        if(radioInput) {
            radioInput.checked = true; // ラジオボタンの値を更新
            this.updateSubmitButtonState();
          }
        })
      freeTextInput?.addEventListener('change', (event) => {
        const text = (event.target as HTMLInputElement).value.trim();
        if(radioInput) {
          radioInput.value = text;
          this.updateSubmitButtonState();
        }
      })
      freeTextInput?.addEventListener('input', (event) => {
        const text = (event.target as HTMLInputElement).value.trim();
        if(radioInput) {
          radioInput.value = text;
          // 文字が入力されている場合はラジオボタンを選択状態にする
          if (text.length > 0) {
            radioInput.checked = true;
          }
          this.updateSubmitButtonState();
        }
      })
    }

    // submitボタンを最後に追加
    const submitGroup = document.createElement('div');
    submitGroup.className = 'form-group';
    submitGroup.innerHTML = '<button type="submit" class="form-submit-group" disabled>送信する</button>';
    this.form.appendChild(submitGroup);

    // submitButtonの参照を取得
    this.submitButton = this.form.querySelector<HTMLButtonElement>('button[type="submit"]');

    // フォーム送信イベントを再設定
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // 初期状態で送信ボタンの状態を更新
    this.updateSubmitButtonState();
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

        .freeflow-container {
          height: 300px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          position: relative;
          overflow: hidden;
        }

        .freeflow-content-wrapper {
          height: 100%;
          overflow-y: auto;
          padding: 10px;
        }

        .freeflow-container::before,
        .freeflow-container::after {
          content: '';
          position: absolute;
          left: 1px;
          right: 1px;
          height: 20px;
          pointer-events: none;
          z-index: 2;
          transition: opacity 0.3s ease;
        }

        .freeflow-container::before {
          top: 1px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.9), transparent);
          border-radius: 4px 4px 0 0;
        }

        .freeflow-container::after {
          bottom: 1px;
          background: linear-gradient(to top, rgba(255,255,255,0.9), transparent);
          border-radius: 0 0 4px 4px;
        }

        .freeflow-container.scroll-top::before {
          opacity: 0;
        }

        .freeflow-container.scroll-bottom::after {
          opacity: 0;
        }

        .freeflow-item {
          padding: 8px 12px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #007bff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }

        .freeflow-item.fade-in {
          opacity: 0;
          transform: translateY(-10px);
        }

        .freeflow-content {
          flex: 1;
          color: #333;
          font-weight: 400;
          margin-right: 8px;
        }

        .freeflow-count {
          color: #6c757d;
          font-weight: bold;
          font-size: 0.9em;
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 12px;
          min-width: 24px;
          text-align: center;
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
    this.recreateDisplayContainer();
  }

  private recreateDisplayContainer(): void {
    const chartContainer = this._shadowRoot.querySelector('.chart-container');
    if (!chartContainer) return;

    // 既存のチャートを破棄
    this.cleanup();

    const view = this.getAttribute('view') || 'bar';

    if (view === 'freeflow') {
      // freeflowコンテナを作成
      chartContainer.innerHTML = '<div class="freeflow-container" id="freeflow-container"><div class="freeflow-content-wrapper" id="freeflow-display"></div></div>';
      this.chartCanvas = null;

      // スクロールイベントリスナーを追加
      const freeflowContainer = chartContainer.querySelector('#freeflow-container') as HTMLElement;
      const freeflowWrapper = chartContainer.querySelector('#freeflow-display') as HTMLElement;
      if (freeflowContainer && freeflowWrapper) {
        freeflowWrapper.addEventListener('scroll', () => {
          this.updateScrollIndicators(freeflowContainer);
        });

        // 初期状態でスクロールインジケーターを設定
        setTimeout(() => {
          this.updateScrollIndicators(freeflowContainer);
        }, 100);
      }
    } else {
      // デフォルト（bar）: チャートキャンバスを作成
      chartContainer.innerHTML = '<canvas id="chart"></canvas>';
      this.chartCanvas = chartContainer.querySelector('#chart');
      this.createChart();
    }

    // 現在の投票結果を要求して表示を更新
    this.requestCurrentVoteResult();
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

  private isFormValid(): boolean {
    if (!this.form) return false;

    // ラジオボタンが選択されているかチェック
    const selectedRadio = this.form.querySelector<HTMLInputElement>('input[type="radio"][name="choice"]:checked');
    if (!selectedRadio) return false;

    // フリーテキストの場合、値が入力されているかチェック
    if (selectedRadio.id === 'freetext-radio') {
      const freeTextInput = this.form.querySelector<HTMLInputElement>('#freetext-input');
      return freeTextInput ? freeTextInput.value.trim().length > 0 : false;
    }

    return true;
  }

  private updateSubmitButtonState(): void {
    if (!this.submitButton) return;

    const isValid = this.isFormValid();
    this.submitButton.disabled = !isValid;
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.voteKey) {
      console.error('Vote key is not set');
      return;
    }

    if (!this.form || !this.submitButton) return;

    // 送信ボタンがdisabledの場合は処理を中断
    if (this.submitButton.disabled) {
      return;
    }

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

    // フォームリセット後に送信ボタンの状態を更新
    this.updateSubmitButtonState();

    // 送信完了メッセージ
    // this.showMessage('送信しました', 'success');
  }

  private handleVoteUpdate(event: CustomEvent): void {
    const message = event.detail as VoteUpdateMessage;

    if (message.data.key === this.voteKey) {
      this.updateDisplay(message.data.summary);
    }
  }

  private updateDisplay(summary: Record<string, number>): void {
    const view = this.getAttribute('view') || 'bar';

    if (view === 'freeflow') {
      this.updateFreeflowDisplay(summary);
    } else {
      this.updateChart(summary);
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

  private updateFreeflowDisplay(summary: Record<string, number>): void {
    const freeflowWrapper = this._shadowRoot.querySelector('#freeflow-display') as HTMLElement;
    const freeflowContainer = this._shadowRoot.querySelector('#freeflow-container') as HTMLElement;
    if (!freeflowWrapper || !freeflowContainer) return;

    // 既存のアイテムのコンテンツを記録
    const existingItems = new Set<string>();
    const existingElements = freeflowWrapper.querySelectorAll('.freeflow-item');
    existingElements.forEach(element => {
      const contentElement = element.querySelector('.freeflow-content');
      if (contentElement) {
        existingItems.add(contentElement.textContent || '');
      }
    });

    // コンテナをクリア
    freeflowWrapper.innerHTML = '';

    // 投票結果をソートして表示（投票数の多い順）
    const sortedEntries = Object.entries(summary).sort((a, b) => b[1] - a[1]);

    sortedEntries.forEach(([content, count]) => {
      const itemElement = document.createElement('div');
      const isNewItem = !existingItems.has(content);

      // 新しいアイテムの場合、アニメーション用のクラスを追加
      if (isNewItem) {
        itemElement.className = 'freeflow-item fade-in';
      } else {
        itemElement.className = 'freeflow-item';
      }

      const contentElement = document.createElement('span');
      contentElement.className = 'freeflow-content';
      contentElement.textContent = content;

      const countElement = document.createElement('span');
      countElement.className = 'freeflow-count';
      countElement.textContent = count > 1 ? `(${count})` : '';

      itemElement.appendChild(contentElement);
      itemElement.appendChild(countElement);
      freeflowWrapper.appendChild(itemElement);

      // 新しいアイテムの場合、アニメーションを開始
      if (isNewItem) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            itemElement.classList.remove('fade-in');
          });
        });
      }
    });

    // スクロール状態を更新
    this.updateScrollIndicators(freeflowContainer);

    // 最新の投票が見えるように一番下にスクロール
    freeflowWrapper.scrollTop = freeflowWrapper.scrollHeight;
  }

  private updateScrollIndicators(container: HTMLElement): void {
    const wrapper = container.querySelector('.freeflow-content-wrapper') as HTMLElement;
    if (!wrapper) return;

    const isAtTop = wrapper.scrollTop <= 5;
    const isAtBottom = wrapper.scrollTop >= wrapper.scrollHeight - wrapper.clientHeight - 5;

    // スクロール位置に応じてクラスを更新
    if (isAtTop) {
      container.classList.add('scroll-top');
    } else {
      container.classList.remove('scroll-top');
    }

    if (isAtBottom) {
      container.classList.add('scroll-bottom');
    } else {
      container.classList.remove('scroll-bottom');
    }
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
