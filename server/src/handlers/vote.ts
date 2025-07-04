import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDBService } from '../services/dynamodb';
import { webSocketService } from '../services/websocket';
import { VoteItem, VoteMessage, RequestVoteResultMessage, ReactionMessage } from '../models/vote';
import { validateVoteMessage } from '../utils/validation';
import { createWebSocketResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket vote event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;

    // メッセージをパース
    let message: VoteMessage | RequestVoteResultMessage | ReactionMessage;
    try {
      const parsedBody = JSON.parse(event.body || '{}');
      message = parsedBody as VoteMessage | RequestVoteResultMessage | ReactionMessage;
    } catch (error) {
      console.error('Invalid JSON in message body:', error);
      return createWebSocketResponse(400);
    }

    // typeフィールドによる処理分岐
    if (message.type === 'REACTION') {
      // リアクション処理
      const reactionMessage = message as ReactionMessage;

      // バリデーション
      if (!reactionMessage.data.emoji || typeof reactionMessage.data.emoji !== 'string') {
        console.error('Invalid emoji in reaction message');
        return createWebSocketResponse(400);
      }

      if (!reactionMessage.data.timestamp || typeof reactionMessage.data.timestamp !== 'number') {
        console.error('Invalid timestamp in reaction message');
        return createWebSocketResponse(400);
      }

      console.log(`Received reaction: ${reactionMessage.data.emoji} from connection: ${connectionId}`);

      // 全クライアントにリアクションをブロードキャスト
      await webSocketService.broadcastReaction(event, reactionMessage.data.emoji, reactionMessage.data.timestamp);

    } else if (message.type === 'VOTE') {
      // 投票処理
      const voteMessage = message as VoteMessage;

      // バリデーション
      const validation = validateVoteMessage(voteMessage.data);
      if (!validation.isValid) {
        console.error('Validation error:', validation.error);
        return createWebSocketResponse(400);
      }

      // 既存投票の削除（置換の場合）
      if (voteMessage.data.voteId) {
        try {
          await dynamoDBService.deleteVote(voteMessage.data.key, voteMessage.data.voteId);
          console.log(`Existing vote deleted: ${voteMessage.data.voteId} for key: ${voteMessage.data.key}`);
        } catch (error) {
          console.error('Failed to delete existing vote:', error);
          // 削除に失敗しても新規投票は続行
        }
      }

      // 投票データを作成
      const now = new Date().toISOString();
      const ttl = Math.floor(Date.now() / 1000) + 3600; // 1時間後

      const vote: VoteItem = {
        key: voteMessage.data.key,
        voteId: uuidv4(),
        content: voteMessage.data.content,
        createdAt: now,
        ttl,
      };

      // DynamoDB に保存
      await dynamoDBService.saveVote(vote);

      console.log(`Vote saved: ${vote.voteId} for key: ${vote.key}`);

      // 全クライアントに投票結果をブロードキャスト（userVoteIdを含む）
      await webSocketService.broadcastVoteUpdate(event, vote.key, vote.voteId);

    } else if (message.type === 'REQUEST_VOTE_RESULT') {
      // 投票結果要求処理
      const requestMessage = message as RequestVoteResultMessage;

      if (!requestMessage.data.key) {
        console.error('Missing key in REQUEST_VOTE_RESULT message');
        return createWebSocketResponse(400);
      }

      // 投票結果を取得
      const voteSummary = await dynamoDBService.getVoteSummaryByKey(requestMessage.data.key);

      if (voteSummary) {
        // 要求したクライアントに投票結果を送信
        await webSocketService.sendVoteUpdateToConnection(event, connectionId, voteSummary);
        console.log(`Vote result sent to ${connectionId} for key: ${requestMessage.data.key}`);
      }

    } else {
      console.error('Invalid message type:', (message as any).type);
      return createWebSocketResponse(400);
    }

    return createWebSocketResponse(200);
  } catch (error) {
    console.error('Error handling vote:', error);
    return createWebSocketResponse(500);
  }
};
