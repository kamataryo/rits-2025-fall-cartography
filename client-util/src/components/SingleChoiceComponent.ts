import { BaseVoteComponent } from './BaseVoteComponent';
import { VoteComponentState } from '../types/index';

export class SingleChoiceComponent extends BaseVoteComponent {
  private selectedValue: string = '';

  protected renderVoteForm(): string {
    if (this.options.length === 0) {
      // フリーテキストのみ
      return `
        <div class="vote-form">
          <div class="form-group">
            <label for="free-text">ご意見をお聞かせください:</label>
            <textarea id="free-text" placeholder="こちらに入力してください..."></textarea>
          </div>
          <button id="submit-btn" type="button">投票する</button>
        </div>
      `;
    }

    // 選択肢がある場合
    const optionsHtml = this.options.map((option, index) => `
      <div class="option-item">
        <label>
          <input type="radio" name="choice" value="${this.escapeHtml(option)}" id="option-${index}">
          ${this.escapeHtml(option)}
        </label>
      </div>
    `).join('');

    // "その他"オプションがある場合の処理
    const hasOtherOption = this.options.some(option =>
      option.toLowerCase().includes('その他') ||
      option.toLowerCase().includes('other')
    );

    const otherTextHtml = hasOtherOption ? `
      <div class="form-group" id="other-text-group" style="display: none;">
        <label for="other-text">その他の内容:</label>
        <textarea id="other-text" placeholder="具体的な内容を入力してください..."></textarea>
      </div>
    ` : '';

    return `
      <div class="vote-form">
        <div class="form-group">
          <label>選択してください:</label>
          <div class="options-list">
            ${optionsHtml}
          </div>
        </div>
        ${otherTextHtml}
        <button id="submit-btn" type="button" disabled>投票する</button>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    if (!this.shadowRoot) return;

    const submitBtn = this.shadowRoot.querySelector('#submit-btn') as HTMLButtonElement;
    const freeTextArea = this.shadowRoot.querySelector('#free-text') as HTMLTextAreaElement;
    const radioButtons = this.shadowRoot.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    const otherTextArea = this.shadowRoot.querySelector('#other-text') as HTMLTextAreaElement;
    const otherTextGroup = this.shadowRoot.querySelector('#other-text-group') as HTMLElement;

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.handleSubmit();
      });
    }

    // フリーテキストのみの場合
    if (freeTextArea) {
      freeTextArea.addEventListener('input', () => {
        const hasText = freeTextArea.value.trim().length > 0;
        if (submitBtn) {
          submitBtn.disabled = !hasText;
        }
      });

      freeTextArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          this.handleSubmit();
        }
      });
    }

    // 選択肢がある場合
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        this.selectedValue = radio.value;

        if (submitBtn) {
          submitBtn.disabled = false;
        }

        // "その他"オプションの表示/非表示
        if (otherTextGroup && otherTextArea) {
          const isOtherOption = radio.value.toLowerCase().includes('その他') ||
                               radio.value.toLowerCase().includes('other');

          if (isOtherOption) {
            otherTextGroup.style.display = 'block';
            otherTextArea.focus();
          } else {
            otherTextGroup.style.display = 'none';
            otherTextArea.value = '';
          }
        }
      });
    });

    // その他テキストエリアのイベント
    if (otherTextArea) {
      otherTextArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          this.handleSubmit();
        }
      });
    }
  }

  private handleSubmit(): void {
    let content = '';

    if (this.options.length === 0) {
      // フリーテキストのみ
      const freeTextArea = this.shadowRoot?.querySelector('#free-text') as HTMLTextAreaElement;
      content = freeTextArea?.value.trim() || '';
    } else {
      // 選択肢がある場合
      const selectedRadio = this.shadowRoot?.querySelector('input[type="radio"]:checked') as HTMLInputElement;
      if (!selectedRadio) {
        return;
      }

      content = selectedRadio.value;

      // "その他"オプションの場合、テキストエリアの内容を使用
      const isOtherOption = content.toLowerCase().includes('その他') ||
                           content.toLowerCase().includes('other');

      if (isOtherOption) {
        const otherTextArea = this.shadowRoot?.querySelector('#other-text') as HTMLTextAreaElement;
        const otherText = otherTextArea?.value.trim();
        if (otherText) {
          content = otherText;
        }
      }
    }

    if (content) {
      this.sendVote(content);
      // 投票後、状態をREADYに戻す（再投票可能にする）
      setTimeout(() => {
        this.setState(this.state === VoteComponentState.VOTING ? VoteComponentState.READY : this.state);
      }, 1000);
    }
  }
}

// WebComponentとして登録
customElements.define('single-choice', SingleChoiceComponent);
