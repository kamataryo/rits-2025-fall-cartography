import { webSocketService } from '../services/WebSocketService';
import { ReactionBroadcastMessage } from '../types/index';

export class ReactionComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private isExpanded: boolean = false;
  private expandTimeout: number | null = null;
  private hideTimeout: number | null = null;
  private touchStartTime: number = 0;
  private longPressThreshold: number = 500; // 500ms
  private componentConnected: boolean = false;

  static get observedAttributes(): string[] {
    return ['emojis'];
  }

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback(): void {
    this.componentConnected = true;
    this.setupGlobalStyles();
    this.setupEventListeners();
    this.setupWebSocket();
  }

  disconnectedCallback(): void {
    this.componentConnected = false;
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'emojis' && oldValue !== newValue && this.componentConnected) {
      this.updateEmojiOptions();
    }
  }

  private getEmojiList(): string[] {
    const emojis = this.getAttribute('emojis');
    if (emojis && emojis.trim()) {
      return emojis.split(',').map(e => e.trim()).filter(e => e);
    }
    return ['👍']; // デフォルト
  }

  private setupGlobalStyles(): void {
    // 既にスタイルが追加されているかチェック
    const existingStyle = document.getElementById('reaction-component-global-styles');
    if (existingStyle) return;

    // グローバルスタイルを作成
    const style = document.createElement('style');
    style.id = 'reaction-component-global-styles';
    style.textContent = `
      .flying-emoji {
        position: fixed;
        font-size: 48px;
        pointer-events: none;
        z-index: 1001;
        user-select: none;
        -webkit-user-select: none;
      }

      @keyframes flyUp {
      0% {
        offset-distance: 0%;
        opacity: 1;
        transform: scale(1);
      }
      100% {
        offset-distance: 100%;
        opacity: 0;
      }
      }

      .flying-emoji.animate1 {
        animation: flyUp 3s ease-out forwards;
        offset-path: path("M 0 0 C -50 -200, 50 -400, 0 -600");
        offset-rotate: 0deg;
        offset-distance: 0%;
        opacity: 1;
      }

      .flying-emoji.animate2 {
        animation: flyUp 3s ease-out forwards;
        offset-path: path("M 0 0 C 50 -200, -50 -400, 0 -600");
        offset-rotate: 0deg;
        offset-distance: 0%;
        opacity: 1;
      }

    `;

    document.head.appendChild(style);
  }

  private render(): void {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .reaction-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .main-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #007bff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          transition: all 0.3s ease;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .main-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
        }

        .main-button:active {
          transform: scale(0.95);
        }

        .emoji-options {
          position: absolute;
          bottom: 70px;
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .emoji-options.expanded {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .emoji-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e0e0e0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .emoji-button:hover {
          transform: scale(1.1);
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .emoji-button:active {
          transform: scale(0.9);
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .main-button {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .emoji-button {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .emoji-options {
            bottom: 60px;
          }
        }
      </style>

      <div class="reaction-container">
        <button class="main-button" id="main-button">
          👍
        </button>
        <div class="emoji-options" id="emoji-options">
          <!-- 動的に生成される -->
        </div>
      </div>
    `;

    this.updateEmojiOptions();
  }

  private updateEmojiOptions(): void {
    const emojiOptions = this._shadowRoot.querySelector('#emoji-options');
    const mainButton = this._shadowRoot.querySelector('#main-button');

    if (!emojiOptions || !mainButton) return;

    const emojis = this.getEmojiList();

    // メインボタンのEmojiを最初のEmojiに設定
    mainButton.textContent = emojis[0];

    // Emoji選択肢を生成
    emojiOptions.innerHTML = '';
    emojis.forEach(emoji => {
      const button = document.createElement('button');
      button.className = 'emoji-button';
      button.textContent = emoji;
      button.addEventListener('click', () => this.selectEmoji(emoji));
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.selectEmoji(emoji);
      });
      emojiOptions.appendChild(button);
    });
  }

  private setupEventListeners(): void {
    const mainButton = this._shadowRoot.querySelector('#main-button');
    const emojiOptions = this._shadowRoot.querySelector('#emoji-options');
    if (!mainButton || !emojiOptions) return;

    // メインボタンのマウスイベント
    mainButton.addEventListener('mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.showOptions();
    });

    mainButton.addEventListener('mouseleave', () => {
      this.hideTimeout = window.setTimeout(() => {
        this.hideOptions();
      }, 300); // 300ms の猶予
    });

    mainButton.addEventListener('click', () => this.selectEmoji(this.getEmojiList()[0]));

    // emoji-optionsのマウスイベント
    emojiOptions.addEventListener('mouseenter', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    });

    emojiOptions.addEventListener('mouseleave', () => {
      this.hideTimeout = window.setTimeout(() => {
        this.hideOptions();
      }, 300); // 300ms の猶予
    });

    // タッチイベント
    mainButton.addEventListener('touchstart', (e) => this.handleTouchStart(e as TouchEvent));
    mainButton.addEventListener('touchend', (e) => this.handleTouchEnd(e as TouchEvent));
    mainButton.addEventListener('touchcancel', () => this.handleTouchCancel());

    // コンテナ外クリックで閉じる
    document.addEventListener('click', (e) => this.handleDocumentClick(e));
    document.addEventListener('touchstart', (e) => this.handleDocumentClick(e));
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    this.touchStartTime = Date.now();

    // 長押し検出
    this.expandTimeout = window.setTimeout(() => {
      this.showOptions();
    }, this.longPressThreshold);
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    if (this.expandTimeout) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = null;
    }

    const touchDuration = Date.now() - this.touchStartTime;

    if (touchDuration < this.longPressThreshold && !this.isExpanded) {
      // 短いタップ：デフォルトEmojiを送信
      this.selectEmoji(this.getEmojiList()[0]);
    } else if (this.isExpanded) {
      // 展開中の場合は何もしない（Emoji選択を待つ）
    }
  }

  private handleTouchCancel(): void {
    if (this.expandTimeout) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = null;
    }
  }

  private handleDocumentClick(e: Event): void {
    const target = e.target as Element;
    if (!this._shadowRoot.contains(target)) {
      this.hideOptions();
    }
  }

  private showOptions(): void {
    if (this.getEmojiList().length <= 1) return;

    this.isExpanded = true;
    const emojiOptions = this._shadowRoot.querySelector('#emoji-options');
    if (emojiOptions) {
      emojiOptions.classList.add('expanded');
    }
  }

  private hideOptions(): void {
    this.isExpanded = false;
    const emojiOptions = this._shadowRoot.querySelector('#emoji-options');
    if (emojiOptions) {
      emojiOptions.classList.remove('expanded');
    }
  }

  private selectEmoji(emoji: string): void {
    // WebSocketでリアクションを送信
    webSocketService.sendReaction(emoji);

    // 選択肢を閉じる
    this.hideOptions();

    // 視覚的フィードバック
    this.showFlyingEmoji(emoji);
  }

  private showFlyingEmoji(emoji: string): void {
    const flyingEmoji = document.createElement('div');
    flyingEmoji.className = 'flying-emoji';
    flyingEmoji.textContent = emoji;

    // メインボタンの位置を取得
    const mainButton = this._shadowRoot.querySelector('#main-button');
    if (!mainButton) return;

    const rect = mainButton.getBoundingClientRect();
    flyingEmoji.style.left = `${10 - Math.random() * 10 + rect.left + rect.width / 2}px`;
    flyingEmoji.style.top = `${10 - Math.random() * 10 + rect.top + rect.height / 2}px`;

    document.body.appendChild(flyingEmoji);

    // より確実なタイミングでアニメーション開始
    setTimeout(() => {
      const animateClassName = Math.random() > 0.5 ? 'animate1' : 'animate2'
      flyingEmoji.classList.add(animateClassName);
    }, 10); // 10ms の遅延

    // アニメーション終了後に削除
    setTimeout(() => {
      if (flyingEmoji.parentNode) {
        flyingEmoji.parentNode.removeChild(flyingEmoji);
      }
    }, 3000);
  }

  private setupWebSocket(): void {
    // リアクションブロードキャストの監視
    webSocketService.addEventListener('reaction-broadcast', (event: Event) => {
      this.handleReactionBroadcast(event as CustomEvent);
    });

    // WebSocket接続を開始（まだ接続されていない場合）
    if (webSocketService.getState() === 'disconnected') {
      webSocketService.connect();
    }
  }

  private handleReactionBroadcast(event: CustomEvent): void {
    const message = event.detail as ReactionBroadcastMessage;

    // 受信したリアクションを画面に表示
    this.showReceivedReaction(message.data.emoji);
  }

  private showReceivedReaction(emoji: string): void {
    const flyingEmoji = document.createElement('div');
    flyingEmoji.className = 'flying-emoji';
    flyingEmoji.textContent = emoji;

    // ランダムな位置から開始
    const startX = window.innerWidth + Math.random() * 20 - 20 - 50;
    const startY = window.innerHeight - 50;

    flyingEmoji.style.left = `${startX}px`;
    flyingEmoji.style.top = `${startY}px`;

    document.body.appendChild(flyingEmoji);

    // より確実なタイミングでアニメーション開始
    setTimeout(() => {
      const animateClassName = Math.random() > 0.5 ? 'animate1' : 'animate2'
      flyingEmoji.classList.add(animateClassName);
    }, 10); // 10ms の遅延

    // アニメーション終了後に削除
    setTimeout(() => {
      if (flyingEmoji.parentNode) {
        flyingEmoji.parentNode.removeChild(flyingEmoji);
      }
    }, 3000);
  }

  private cleanup(): void {
    if (this.expandTimeout) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
}

// カスタム要素として登録
customElements.define('reaction-component', ReactionComponent);
