// WebSocketサービスをグローバルに公開
import { webSocketService } from './services/WebSocketService';

// WebComponentsをインポート（自動登録される）
import './components/SingleChoiceComponent';
import './components/MultiChoiceComponent';

// グローバルオブジェクトに公開
declare global {
  interface Window {
    VoteClient: {
      webSocketService: typeof webSocketService;
      setWebSocketUrl: (url: string) => void;
    };
  }
}

// WebSocketサービスをグローバルに公開
(window as any).webSocketService = webSocketService;

// VoteClientオブジェクトを作成
(window as any).VoteClient = {
  webSocketService,
  setWebSocketUrl: (url: string) => {
    webSocketService.setUrl(url);
  }
};

// コンソールに初期化メッセージを表示
console.log('Vote Client Library loaded');
console.log('Available components: <single-choice>, <multi-choice>');
console.log('WebSocket service:', webSocketService);

export { webSocketService };
export * from './types/index';
