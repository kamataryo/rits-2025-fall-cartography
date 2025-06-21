import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { readFileSync } from 'fs';
import { join } from 'path';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Serve client request:', JSON.stringify(event, null, 2));

  try {
    // クライアントライブラリファイルのパス
    const clientFilePath = join(__dirname, '../vote-client.min.js');

    let clientCode: string;

    try {
      // ビルドされたクライアントライブラリを読み込み
      clientCode = readFileSync(clientFilePath, 'utf8');
    } catch (error) {
      console.error('Client library file not found:', error);

      // フォールバック: 基本的なクライアントコードを返す
      clientCode = `
// Vote Client Library (Fallback)
console.warn('Vote Client Library: Using fallback version. Please build the client library.');

// 基本的なWebComponentの定義
class VoteComponentBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = \`
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: sans-serif;">
        <p>⚠️ Vote Client Library is not properly built.</p>
        <p>Please run: <code>cd server/src/client-util && npm install && npm run build</code></p>
      </div>
    \`;
  }
}

// WebComponentsを登録
if (typeof customElements !== 'undefined') {
  customElements.define('single-choice', VoteComponentBase);
  customElements.define('multi-choice', VoteComponentBase);
}

console.log('Vote Client Library (Fallback) loaded');
      `.trim();
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: clientCode
    };

  } catch (error) {
    console.error('Error serving client library:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to serve client library'
      })
    };
  }
};
