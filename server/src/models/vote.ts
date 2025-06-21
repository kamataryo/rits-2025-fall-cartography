// WebSocket メッセージの基本型
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
}

// 投票データ型
export interface Vote {
  voteId: string;
  key: string;
  content: string;
  createdAt: string;
  ttl: number;
}

// 投票送信メッセージ（クライアント → サーバー）
export interface VoteMessage extends WebSocketMessage<{
  key: string;
  content: string;
}> {
  type: 'VOTE';
}

// 投票結果要求メッセージ（クライアント → サーバー）
export interface RequestVoteResultMessage extends WebSocketMessage<{
  key: string;
}> {
  action?: string;
  type: 'REQUEST_VOTE_RESULT';
}

// 投票結果配信メッセージ（サーバー → クライアント）
export interface VoteUpdateMessage extends WebSocketMessage<{
  key: string;
  summary: Record<string, number>;
  totalCount: number;
}> {
  type: 'VOTE_UPDATE';
}

// 接続管理データ型
export interface Connection {
  connectionId: string;
  ttl: number;
}

// DynamoDB アイテム型（内部使用）
export interface VoteItem {
  key: string;        // パーティションキー
  voteId: string;     // ソートキー
  content: string;
  createdAt: string;
  ttl: number;
}

export interface ConnectionItem {
  connectionId: string; // パーティションキー
  ttl: number;
}
