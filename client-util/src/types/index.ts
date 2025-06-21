// WebSocket メッセージの基本型（サーバー側と共通）
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
}

// 投票送信メッセージ（クライアント → サーバー）
export interface VoteMessage extends WebSocketMessage<{
  key: string;
  content: string;
  voteId?: string;  // 既存投票のID（置換時に使用）
}> {
  action: 'vote';
  type: 'VOTE';
}

// 投票結果要求メッセージ（クライアント → サーバー）
export interface RequestVoteResultMessage extends WebSocketMessage<{
  key: string;
}> {
  action: 'vote';
  type: 'REQUEST_VOTE_RESULT';
}

// 投票結果配信メッセージ（サーバー → クライアント）
export interface VoteUpdateMessage extends WebSocketMessage<{
  key: string;
  summary: Record<string, number>;
  totalCount: number;
  userVoteId?: string;  // 投票したユーザーのvoteId
}> {
  type: 'VOTE_UPDATE';
}

// コンポーネントの状態
export enum VoteComponentState {
  CONNECTING = 'connecting',
  READY = 'ready',
  VOTING = 'voting',
  ERROR = 'error'
}

// WebSocket接続状態
export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// コンポーネント共通プロパティ
interface BaseVoteComponentProps {
  voteKey: string;
  options: string[];
}

// 単一選択コンポーネントプロパティ
export interface SingleChoiceProps extends BaseVoteComponentProps {}

// 複数選択コンポーネントプロパティ
export interface MultiChoiceProps extends BaseVoteComponentProps {}

// 投票データ（LocalStorage用）
export interface VoteRecord {
  voteKey: string;
  voteIds: string[];  // content[] から変更
  timestamp: number;
}
