// WebSocket API テスト用スクリプト
// 使用方法: node test-websocket.js [WebSocket-URL]

const WebSocket = require('ws');

// コマンドライン引数からURLを取得、または環境変数から取得
const wsUrl = process.argv[2] || process.env.WEBSOCKET_URL || 'wss://your-api-id.execute-api.ap-northeast-1.amazonaws.com/dev';

console.log(`WebSocket URL: ${wsUrl}`);
console.log('接続中...\n');

const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
  console.log('✅ WebSocket 接続成功');

  // テスト投票を複数送信
  const testVotes = [
    {
      key: 'test-slide-01',
      content: 'CLI からのテスト投票です（1回目）'
    },
    {
      key: 'test-slide-01',
      content: 'CLI からのテスト投票です（2回目）'
    },
    {
      key: 'test-slide-02',
      content: '別のスライドへの投票テストです'
    }
  ];

  // 1秒間隔で投票を送信
  testVotes.forEach((vote, index) => {
    setTimeout(() => {
      const voteMessage = {
        action: 'vote',
        type: 'VOTE',
        data: vote
      };

      console.log(`📤 投票送信 (${index + 1}/${testVotes.length}):`, vote);
      ws.send(JSON.stringify(voteMessage));
    }, (index + 1) * 1000);
  });

  // 5秒後に接続を閉じる
  setTimeout(() => {
    console.log('\n🔌 接続を閉じます...');
    ws.close();
  }, 6000);
});

ws.on('message', function message(data) {
  try {
    const message = JSON.parse(data.toString());
    console.log('📥 受信メッセージ:', {
      type: message.type,
      key: message.data?.key,
      totalCount: message.data?.totalCount,
      summary: message.data?.summary,
    });

  } catch (error) {
    console.error('❌ メッセージ解析エラー:', error);
    console.log('Raw data:', data.toString());
  }
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket エラー:', err.message);
  process.exit(1);
});

ws.on('close', function close(code, reason) {
  console.log(`🔌 WebSocket 接続終了 (code: ${code}, reason: ${reason || 'なし'})`);
  process.exit(0);
});

// Ctrl+C でのグレースフル終了
process.on('SIGINT', () => {
  console.log('\n\n⏹️  テストを中断します...');
  ws.close();
});
