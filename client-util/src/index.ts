// WebSocketサービスをグローバルに公開
import { webSocketService } from './services/WebSocketService';

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
