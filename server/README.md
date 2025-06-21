# 投票システム WebSocket API

授業スライド用のリアルタイム投票システムです。

## 🚀 デプロイ

### 前提条件
- Node.js v22以上
- AWS CLI設定済み
- Serverless Framework

### セットアップ・デプロイ手順

```bash
# 依存関係のインストール
cd server
npm install

# TypeScriptコンパイル
npm run build

# AWSにデプロイ
npm run deploy
```

### デプロイ後の確認

デプロイが完了すると、WebSocket APIのURLが出力されます：

```
WebSocketURL: wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev
```

## 📡 WebSocket API

### エンドポイント
```
wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev
```

### メッセージ形式

#### 投票送信（クライアント → サーバー）
```json
{
  "action": "vote",
  "type": "VOTE",
  "data": {
    "key": "slide-01-introduction",
    "content": "地図の歴史について詳しく知りたいです"
  }
}
```

#### 投票結果配信（サーバー → 全クライアント）
```json
{
  "type": "VOTE_UPDATE", 
  "data": {
    "key": "slide-01-introduction",
    "votes": [
      {
        "voteId": "01234567-89ab-cdef-0123-456789abcdef",
        "key": "slide-01-introduction",
        "content": "地図の歴史について詳しく知りたいです",
        "createdAt": "2025-06-21T13:45:30.123Z",
        "ttl": 1719062730
      }
    ],
    "totalCount": 1
  }
}
```

## 🔧 技術仕様

- **Runtime**: Node.js v22
- **Framework**: Serverless Framework
- **Database**: DynamoDB
- **TTL**: 1時間自動削除
- **文字数制限**: 1024文字
- **認証**: なし（匿名投票）
- **CORS**: 全オリジン許可

## 📊 データ構造

### DynamoDB テーブル: votes
```
パーティションキー: key (String) - 投票キー（例：slide-01-introduction）
ソートキー: voteId (String) - UUID
属性: 
  - content (String) - 投票内容（最大1024文字）
  - createdAt (String) - ISO 8601形式のタイムスタンプ
  - ttl (Number) - Unix timestamp（1時間後に自動削除）
```

### DynamoDB テーブル: connections
```
パーティションキー: connectionId (String) - WebSocket接続ID
属性:
  - ttl (Number) - Unix timestamp（接続切れ後の掃除用）
```

## 🌐 クライアント実装例

### 基本的な接続・送受信

```javascript
// WebSocket接続
const ws = new WebSocket('wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev');

// 接続確立時
ws.onopen = () => {
  console.log('WebSocket connected');
};

// 投票送信
function sendVote(key, content) {
  const message = {
    action: 'vote',
    type: 'VOTE',
    data: {
      key: key,
      content: content
    }
  };
  
  ws.send(JSON.stringify(message));
}

// 結果受信
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'VOTE_UPDATE') {
    console.log('投票結果更新:', message.data);
    updateVoteDisplay(message.data);
  }
};

// エラーハンドリング
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// 接続切断時
ws.onclose = () => {
  console.log('WebSocket disconnected');
};
```

### 投票結果の表示例

```javascript
function updateVoteDisplay(voteData) {
  const { key, votes, totalCount } = voteData;
  
  // 投票数を表示
  document.getElementById('vote-count').textContent = `投票数: ${totalCount}`;
  
  // 投票内容一覧を表示
  const voteList = document.getElementById('vote-list');
  voteList.innerHTML = '';
  
  votes.forEach(vote => {
    const voteElement = document.createElement('div');
    voteElement.className = 'vote-item';
    voteElement.innerHTML = `
      <div class="vote-content">${vote.content}</div>
      <div class="vote-time">${new Date(vote.createdAt).toLocaleString()}</div>
    `;
    voteList.appendChild(voteElement);
  });
}
```

## 🚨 制限事項

- 投票内容は1024文字まで
- 投票キーは100文字まで
- データは1時間で自動削除
- 重複投票制御なし（クライアント側で実装）
- レート制限: API Gateway デフォルト設定

## 🛠️ 開発・運用

### WebSocket API テスト

#### CLI でのテスト（wscat を使用）

```bash
# wscat のインストール
npm install -g wscat

# WebSocket 接続テスト
wscat -c wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev

# 接続後、以下のメッセージを送信してテスト
{"action":"vote","type":"VOTE","data":{"key":"test-slide","content":"テスト投票です"}}
```

#### Node.js スクリプトでのテスト

プロジェクトに含まれているテストスクリプトを使用：

```bash
# WebSocket依存関係のインストール
npm install ws

# 基本テスト（単一接続）
node test-websocket.js wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev

# ブロードキャストテスト（複数接続）
node test-websocket-broadcast.js wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev 3

# または環境変数で指定
export WEBSOCKET_URL=wss://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev
node test-websocket.js
node test-websocket-broadcast.js
```

##### 基本テスト（test-websocket.js）
単一接続での動作確認：
- WebSocket接続の確立
- 複数の投票メッセージを1秒間隔で送信
- リアルタイム投票結果の受信・表示
- 自動的な接続終了

##### ブロードキャストテスト（test-websocket-broadcast.js）
複数接続でのブロードキャスト機能確認：
- 複数のWebSocket接続を同時確立（デフォルト3接続）
- ランダムな接続から投票を送信
- **全接続が同じメッセージを受信することを検証**
- 統計情報の表示（送信数・受信数・成功率）

ブロードキャストテスト実行例：
```
WebSocket URL: wss://abc123.execute-api.ap-northeast-1.amazonaws.com/dev
接続数: 3
ブロードキャストテストを開始します...

✅ Client-1 接続成功
✅ Client-2 接続成功
✅ Client-3 接続成功

🚀 全3接続が完了しました。ブロードキャストテストを開始します。

📤 Client-2 が投票送信 (1/4): { key: 'broadcast-test-01', content: 'ブロードキャストテスト 1回目' }
📥 Client-1 が受信: { key: 'broadcast-test-01', totalCount: 1, votesCount: 1, timestamp: '14:15:30' }
   最新投票: "ブロードキャストテスト 1回目"
📥 Client-2 が受信: { key: 'broadcast-test-01', totalCount: 1, votesCount: 1, timestamp: '14:15:30' }
   最新投票: "ブロードキャストテスト 1回目"
📥 Client-3 が受信: { key: 'broadcast-test-01', totalCount: 1, votesCount: 1, timestamp: '14:15:30' }
   最新投票: "ブロードキャストテスト 1回目"

📊 ブロードキャストテスト結果:
Client-1:
  接続状態: ✅ 接続中
  送信数: 1
  受信数: 4
Client-2:
  接続状態: ✅ 接続中
  送信数: 2
  受信数: 4
Client-3:
  接続状態: ✅ 接続中
  送信数: 1
  受信数: 4

📈 統計:
総送信数: 4
総受信数: 12
期待受信数: 12 (送信数 × 接続数)
✅ ブロードキャスト成功: 全クライアントが全メッセージを受信しました
```

#### curl での接続テスト（接続確認のみ）

```bash
# WebSocket ハンドシェイクのテスト
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  -H "Sec-WebSocket-Version: 13" \
  https://[api-id].execute-api.ap-northeast-1.amazonaws.com/dev
```

### ログ確認
```bash
# 投票処理のログを確認
npm run logs

# 特定の関数のログを確認
npx serverless logs -f vote -t
npx serverless logs -f connect -t
npx serverless logs -f disconnect -t
```

### リソース削除
```bash
# 全リソースを削除
npm run remove
```

### ローカル開発
```bash
# TypeScriptの監視モード
npx tsc --watch

# コードの型チェック
npx tsc --noEmit
```

## 📝 環境変数

デプロイ時に自動設定される環境変数：

- `VOTES_TABLE`: 投票データテーブル名
- `CONNECTIONS_TABLE`: 接続管理テーブル名
- `AWS_WEBSOCKET_API_DOMAIN_NAME`: WebSocket API ドメイン名
- `AWS_WEBSOCKET_API_STAGE`: デプロイステージ
- `AWS_REGION`: AWSリージョン

## 🔍 トラブルシューティング

### よくある問題

1. **デプロイエラー**
   ```bash
   # 依存関係を再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **WebSocket接続エラー**
   - デプロイ後のURLが正しいか確認
   - CORS設定を確認

3. **投票が保存されない**
   - DynamoDBテーブルが作成されているか確認
   - IAMロールの権限を確認

4. **ブロードキャストが動作しない**
   - 接続管理テーブルにデータが保存されているか確認
   - WebSocket API の環境変数を確認

### デバッグ方法

```bash
# CloudWatch Logsでエラーを確認
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/voting-system"

# 特定のログストリームを確認
aws logs get-log-events --log-group-name "/aws/lambda/voting-system-dev-vote" --log-stream-name [stream-name]
```

## 🎯 クライアントライブラリ

### 概要
授業スライド用のWebComponentベース投票クライアントライブラリです。

### 使用方法

#### 1. ライブラリの読み込み
```html
<script src="https://[api-id].execute-api.ap-northeast-1.amazonaws.com/[stage]/client/vote-client.js"></script>
```

#### 2. WebComponentの配置

##### 単一選択式
```html
<!-- 選択肢あり -->
<single-choice 
  vote-key="lecture-01-q1"
  options='["選択肢A", "選択肢B", "選択肢C"]'>
</single-choice>

<!-- フリーテキストのみ -->
<single-choice 
  vote-key="lecture-01-q2">
</single-choice>

<!-- 選択肢 + その他 -->
<single-choice 
  vote-key="lecture-01-q3"
  options='["選択肢A", "選択肢B", "その他"]'>
</single-choice>
```

##### 複数選択式
```html
<!-- 選択肢あり -->
<multi-choice 
  vote-key="lecture-01-q4"
  options='["選択肢A", "選択肢B", "選択肢C"]'>
</multi-choice>

<!-- フリーテキストのみ -->
<multi-choice 
  vote-key="lecture-01-q5">
</multi-choice>

<!-- 継続投票可能 -->
<multi-choice 
  vote-key="lecture-01-q6"
  options='["選択肢A", "選択肢B", "選択肢C"]'
  keep-active="true">
</multi-choice>
```

### 属性

#### `<single-choice>` 属性
| 属性 | 必須 | デフォルト | 説明 |
|------|------|-----------|------|
| `vote-key` | ✅ | - | 投票識別キー |
| `options` | ❌ | `[]` | 選択肢配列。空配列または未指定でフリーテキストのみ |

#### `<multi-choice>` 属性
| 属性 | 必須 | デフォルト | 説明 |
|------|------|-----------|------|
| `vote-key` | ✅ | - | 投票識別キー |
| `options` | ❌ | `[]` | 選択肢配列。空配列または未指定でフリーテキストのみ |
| `keep-active` | ❌ | `false` | 投票後もフォームを維持するか |

### 動作仕様

- **自動接続**: コンポーネント初期化時にWebSocket自動接続
- **リアルタイム更新**: 500ms間隔でスロットリング処理
- **状態管理**: LocalStorageで投票済み状態を記憶
- **結果表示**: 投票後に同一コンポーネント内で結果表示
- **複数選択**: 選択項目ごとに連続でVOTEメッセージ送信

### 高度な使用方法

#### WebSocket URLの手動設定
```javascript
// ライブラリ読み込み後
VoteClient.setWebSocketUrl('wss://your-custom-websocket-url');
```

#### 接続状態の監視
```javascript
VoteClient.webSocketService.addEventListener('connection-state-changed', (event) => {
  console.log('WebSocket state:', event.detail);
});
```

### クライアントライブラリのビルド

#### 開発環境セットアップ
```bash
cd server/src/client-util
npm install
```

#### ビルド
```bash
# 本番用ビルド
npm run build

# 開発用ビルド（監視モード）
npm run dev

# 型チェックのみ
npm run type-check
```

#### ビルド成果物
- `dist/vote-client.js` - 単一JSファイル（CDN配信用）
- `dist/index.d.ts` - TypeScript型定義ファイル

## 📄 ライセンス

MIT License

---

**立命館大学 2025年度秋学期**  
**ウェブカートグラフィ入門 - 投票システム**
