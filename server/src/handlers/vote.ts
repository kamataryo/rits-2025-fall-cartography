import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDBService } from '../services/dynamodb';
import { webSocketService } from '../services/websocket';
import { VoteItem, VoteMessage } from '../models/vote';
import { validateVoteMessage } from '../utils/validation';
import { createWebSocketResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket vote event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;

    // メッセージをパース
    let message: VoteMessage;
    try {
      const parsedBody = JSON.parse(event.body || '{}');
      message = parsedBody as VoteMessage;
    } catch (error) {
      console.error('Invalid JSON in message body:', error);
      return createWebSocketResponse(400);
    }

    // メッセージタイプを確認
    if (message.type !== 'VOTE') {
      console.error('Invalid message type:', message.type);
      return createWebSocketResponse(400);
    }

    // バリデーション
    const validation = validateVoteMessage(message.data);
    if (!validation.isValid) {
      console.error('Validation error:', validation.error);
      return createWebSocketResponse(400);
    }

    // 投票データを作成
    const now = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 3600; // 1時間後

    const vote: VoteItem = {
      key: message.data.key,
      voteId: uuidv4(),
      content: message.data.content,
      createdAt: now,
      ttl,
    };

    // DynamoDB に保存
    await dynamoDBService.saveVote(vote);

    console.log(`Vote saved: ${vote.voteId} for key: ${vote.key}`);

    // 全クライアントに投票結果をブロードキャスト
    await webSocketService.broadcastVoteUpdate(event, vote.key);

    return createWebSocketResponse(200);
  } catch (error) {
    console.error('Error handling vote:', error);
    return createWebSocketResponse(500);
  }
};
