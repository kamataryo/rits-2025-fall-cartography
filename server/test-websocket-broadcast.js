// WebSocket API ブロードキャストテスト用スクリプト
// 複数のクライアント接続を作成してブロードキャスト機能をテスト
// 使用方法: node test-websocket-broadcast.js [WebSocket-URL] [接続数]

const WebSocket = require('ws');

// コマンドライン引数からURLと接続数を取得
const wsUrl = process.argv[2] || process.env.WEBSOCKET_URL || 'wss://your-api-id.execute-api.ap-northeast-1.amazonaws.com/dev';
const connectionCount = parseInt(process.argv[3]) || 3;

console.log(`WebSocket URL: ${wsUrl}`);
console.log(`接続数: ${connectionCount}`);
console.log('ブロードキャストテストを開始します...\n');

const connections = [];
let connectedCount = 0;
let messageCount = 0;

// 各接続の状態を管理
const connectionStats = {};

function createConnection(id) {
  const ws = new WebSocket(wsUrl);
  const connectionId = `Client-${id}`;

  connectionStats[connectionId] = {
    connected: false,
    messagesSent: 0,
    messagesReceived: 0,
    lastMessage: null
  };

  ws.on('open', function open() {
    console.log(`✅ ${connectionId} 接続成功`);
    connectionStats[connectionId].connected = true;
    connectedCount++;

    // 全ての接続が完了したらテスト開始
    if (connectedCount === connectionCount) {
      console.log(`\n🚀 全${connectionCount}接続が完了しました。ブロードキャストテストを開始します。\n`);
      startBroadcastTest();
    }
  });

  ws.on('message', function message(data) {
    try {
      const message = JSON.parse(data.toString());
      connectionStats[connectionId].messagesReceived++;
      connectionStats[connectionId].lastMessage = message;

      if (message.type === 'VOTE_UPDATE') {
        console.log(`📥 ${connectionId} が受信:`, {
          key: message.data?.key,
          totalCount: message.data?.totalCount,
          summary: message.data?.summary,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error(`❌ ${connectionId} メッセージ解析エラー:`, error);
    }
  });

  ws.on('error', function error(err) {
    console.error(`❌ ${connectionId} エラー:`, err.message);
    connectionStats[connectionId].connected = false;
  });

  ws.on('close', function close(code, reason) {
    console.log(`🔌 ${connectionId} 接続終了 (code: ${code})`);
    connectionStats[connectionId].connected = false;
  });

  connections.push({ id: connectionId, ws });
  return ws;
}

function startBroadcastTest() {
  const testVotes = [
    { key: 'broadcast-test-01', content: 'ブロードキャストテスト 1回目' },
    { key: 'broadcast-test-01', content: 'ブロードキャストテスト 2回目' },
    { key: 'broadcast-test-02', content: '別キーでのテスト' },
    { key: 'broadcast-test-01', content: 'ブロードキャストテスト 3回目' }
  ];

  let testIndex = 0;

  function sendNextVote() {
    if (testIndex >= testVotes.length) {
      // テスト完了後に統計を表示
      setTimeout(showStats, 2000);
      return;
    }

    const vote = testVotes[testIndex];
    // ランダムな接続から投票を送信
    const randomConnection = connections[Math.floor(Math.random() * connections.length)];

    if (randomConnection.ws.readyState === WebSocket.OPEN) {
      const voteMessage = {
        action: 'vote',
        type: 'VOTE',
        data: vote
      };

      console.log(`📤 ${randomConnection.id} が投票送信 (${testIndex + 1}/${testVotes.length}):`, vote);
      randomConnection.ws.send(JSON.stringify(voteMessage));
      connectionStats[randomConnection.id].messagesSent++;
    }

    testIndex++;
    setTimeout(sendNextVote, 2000); // 2秒間隔で送信
  }

  sendNextVote();
}

function showStats() {
  console.log('\n📊 ブロードキャストテスト結果:');
  console.log('=' .repeat(50));

  let totalSent = 0;
  let totalReceived = 0;

  Object.entries(connectionStats).forEach(([connectionId, stats]) => {
    console.log(`${connectionId}:`);
    console.log(`  接続状態: ${stats.connected ? '✅ 接続中' : '❌ 切断'}`);
    console.log(`  送信数: ${stats.messagesSent}`);
    console.log(`  受信数: ${stats.messagesReceived}`);

    totalSent += stats.messagesSent;
    totalReceived += stats.messagesReceived;
  });

  console.log('\n📈 統計:');
  console.log(`総送信数: ${totalSent}`);
  console.log(`総受信数: ${totalReceived}`);
  console.log(`期待受信数: ${totalSent * connectionCount} (送信数 × 接続数)`);

  if (totalReceived === totalSent * connectionCount) {
    console.log('✅ ブロードキャスト成功: 全クライアントが全メッセージを受信しました');
  } else {
    console.log('⚠️  ブロードキャスト不完全: 一部のメッセージが受信されていません');
  }

  // 接続を閉じる
  setTimeout(() => {
    console.log('\n🔌 全接続を閉じます...');
    connections.forEach(conn => {
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.close();
      }
    });
    process.exit(0);
  }, 1000);
}

// 接続を作成
for (let i = 1; i <= connectionCount; i++) {
  setTimeout(() => {
    createConnection(i);
  }, i * 500); // 0.5秒間隔で接続
}

// Ctrl+C でのグレースフル終了
process.on('SIGINT', () => {
  console.log('\n\n⏹️  テストを中断します...');
  connections.forEach(conn => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.close();
    }
  });
  process.exit(0);
});

// タイムアウト処理（30秒でテスト終了）
setTimeout(() => {
  console.log('\n⏰ テストタイムアウト（30秒）');
  showStats();
}, 30000);
