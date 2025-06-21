import { BaseVoteComponent } from './BaseVoteComponent';
import { VoteComponentState } from '../types/index';
import { webSocketService } from '../services/WebSocketService';

export class MultiChoiceComponent extends BaseVoteComponent {
  private selectedValues: Set<string> = new Set();

  protected renderVoteForm(): string {
    if (this.options.length === 0) {
      // フリーテキストのみ
      return `
        <div class="vote-form">
          <div class="form-group">
            <label for="free-text">ご意見をお聞かせください（複数回投票可能）:</label>
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
          <input type="checkbox" name="choice" value="${this.escapeHtml(option)}" id="option-${index}">
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
          <label>選択してください（複数選択可）:</label>
          <div class="options-list">
            ${optionsHtml}
          </div>
        </div>
        ${otherTextHtml}
        <button id="submit-btn" type="button" disabled>投票する</button>
      </div>
    `;
  }

  // renderResults メソッドを削除（BaseVoteComponent の renderFormAndResults を使用）


  protected setupEventListeners(): void {
    if (!this.shadowRoot) return;

    const submitBtn = this.shadowRoot.querySelector('#submit-btn');
    const freeTextArea = this.shadowRoot.querySelector('#free-text');
    const checkboxes = this.shadowRoot.querySelectorAll('input[type="checkbox"]');
    const otherTextArea = this.shadowRoot.querySelector('#other-text');
    const otherTextGroup = this.shadowRoot.querySelector('#other-text-group');

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.handleSubmit();
      });
    }

    // フリーテキストのみの場合
    if (freeTextArea) {
      freeTextArea.addEventListener('input', () => {
        const hasText = (freeTextArea as any).value.trim().length > 0;
        if (submitBtn) {
          (submitBtn as any).disabled = !hasText;
        }
      });

      freeTextArea.addEventListener('keydown', (e: any) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          this.handleSubmit();
        }
      });
    }

    // 選択肢がある場合
    checkboxes.forEach((checkbox: any) => {
      checkbox.addEventListener('change', () => {
        this.updateSelectedValues();
        this.updateSubmitButton();
        this.handleOtherOption(checkbox);
      });
    });

    // その他テキストエリアのイベント
    if (otherTextArea) {
      otherTextArea.addEventListener('keydown', (e: any) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          this.handleSubmit();
        }
      });
    }
  }

  private updateSelectedValues(): void {
    this.selectedValues.clear();
    const checkboxes = this.shadowRoot?.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes?.forEach((checkbox: any) => {
      this.selectedValues.add(checkbox.value);
    });
  }

  private updateSubmitButton(): void {
    const submitBtn = this.shadowRoot?.querySelector('#submit-btn');
    if (submitBtn) {
      (submitBtn as any).disabled = this.selectedValues.size === 0;
    }
  }

  private handleOtherOption(checkbox: any): void {
    const otherTextGroup = this.shadowRoot?.querySelector('#other-text-group');
    const otherTextArea = this.shadowRoot?.querySelector('#other-text');

    if (!otherTextGroup || !otherTextArea) return;

    const isOtherOption = checkbox.value.toLowerCase().includes('その他') ||
                         checkbox.value.toLowerCase().includes('other');

    if (isOtherOption && checkbox.checked) {
      (otherTextGroup as any).style.display = 'block';
      (otherTextArea as any).focus();
    } else if (isOtherOption && !checkbox.checked) {
      (otherTextArea as any).value = '';
      // 他に"その他"系のチェックボックスがチェックされていない場合のみ非表示
      const otherCheckboxes = Array.from(this.shadowRoot?.querySelectorAll('input[type="checkbox"]:checked') || [])
        .filter((cb: any) => cb.value.toLowerCase().includes('その他') || cb.value.toLowerCase().includes('other'));

      if (otherCheckboxes.length === 0) {
        (otherTextGroup as any).style.display = 'none';
      }
    }
  }

  private handleSubmit(): void {
    if (this.options.length === 0) {
      // フリーテキストのみ
      const freeTextArea = this.shadowRoot?.querySelector('#free-text');
      const content = (freeTextArea as any)?.value.trim() || '';

      if (content) {
        this.sendVote(content);
        // フリーテキストをクリア
        (freeTextArea as any).value = '';
        const submitBtn = this.shadowRoot?.querySelector('#submit-btn');
        if (submitBtn) {
          (submitBtn as any).disabled = true;
        }
      }
    } else {
      // 選択肢がある場合 - 既存の投票を全削除してから新規投票
      const votesToSend: string[] = [];

      this.selectedValues.forEach(value => {
        const isOtherOption = value.toLowerCase().includes('その他') ||
                             value.toLowerCase().includes('other');

        if (isOtherOption) {
          const otherTextArea = this.shadowRoot?.querySelector('#other-text');
          const otherText = (otherTextArea as any)?.value.trim();
          if (otherText) {
            votesToSend.push(otherText);
          }
        } else {
          votesToSend.push(value);
        }
      });

      // 既存の投票を削除してから新規投票を送信
      votesToSend.forEach((content, index) => {
        const existingVoteId = this.voteIds[index] || undefined;
        setTimeout(() => {
          webSocketService.sendVote(this.voteKey, content, existingVoteId);
        }, index * 100); // 100ms間隔で送信
      });

      // 余分な既存投票を削除（空文字で削除）
      if (this.voteIds.length > votesToSend.length) {
        for (let i = votesToSend.length; i < this.voteIds.length; i++) {
          setTimeout(() => {
            webSocketService.sendVote(this.voteKey, '', this.voteIds[i]);
          }, (i + votesToSend.length) * 100);
        }
      }

      // 投票後、状態をREADYに戻す（再投票可能にする）
      setTimeout(() => {
        this.setState(this.state === VoteComponentState.VOTING ? VoteComponentState.READY : this.state);
      }, 1000);
    }
  }

  private clearSelections(): void {
    this.selectedValues.clear();

    // チェックボックスをクリア
    const checkboxes = this.shadowRoot?.querySelectorAll('input[type="checkbox"]');
    checkboxes?.forEach((checkbox: any) => {
      checkbox.checked = false;
    });

    // その他テキストエリアをクリア
    const otherTextArea = this.shadowRoot?.querySelector('#other-text');
    const otherTextGroup = this.shadowRoot?.querySelector('#other-text-group');
    if (otherTextArea) {
      (otherTextArea as any).value = '';
    }
    if (otherTextGroup) {
      (otherTextGroup as any).style.display = 'none';
    }

    // 送信ボタンを無効化
    this.updateSubmitButton();
  }

  // sendVoteのオーバーライドを削除（BaseVoteComponentの実装を使用）
}

// WebComponentとして登録
(window as any).customElements?.define('multi-choice', MultiChoiceComponent);
