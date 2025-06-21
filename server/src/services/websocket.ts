import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { dynamoDBService } from './dynamodb';
import { VoteUpdateMessage } from '../models/vote';

export class WebSocketService {
  // API Gateway Management API クライアントを動的に作成
  private createApiGatewayClient(event: any): ApiGatewayManagementApiClient {
    const region = process.env.AWS_REGION || 'ap-northeast-1';

    // Lambda イベントから WebSocket API の情報を取得
    const requestContext = event.requestContext;
    const apiId = requestContext?.domainName?.split('.')[0] || requestContext?.apiId;
    const stage = requestContext?.stage || 'dev';

    if (!apiId) {
      console.error('Cannot determine WebSocket API ID from request context:', requestContext);
      throw new Error('WebSocket API ID not found in request context');
    }

    const endpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`;
    console.log(`WebSocket endpoint: ${endpoint}`);

    return new ApiGatewayManagementApiClient({
      region,
      endpoint,
    });
  }

  // 特定の接続にメッセージを送信
  async sendMessageToConnection(event: any, connectionId: string, message: any): Promise<boolean> {
    try {
      const client = this.createApiGatewayClient(event);
      const command = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message),
      });

      await client.send(command);
      return true;
    } catch (error) {
      console.error(`Failed to send message to connection ${connectionId}:`, error);

      // 接続が無効な場合は DynamoDB から削除
      if ((error as any).statusCode === 410) {
        await dynamoDBService.deleteConnection(connectionId);
      }

      return false;
    }
  }

  // 特定の接続に投票結果を送信
  async sendVoteUpdateToConnection(event: any, connectionId: string, voteSummary: {key: string, summary: Record<string, number>, totalCount: number}): Promise<void> {
    const message: VoteUpdateMessage = {
      type: 'VOTE_UPDATE',
      data: voteSummary,
    };

    await this.sendMessageToConnection(event, connectionId, message);
  }

  // 全クライアントに投票結果をブロードキャスト
  async broadcastVoteUpdate(event: any, key: string): Promise<void> {
    try {
      // 投票データを取得
      const votes = await dynamoDBService.getVotesByKey(key);

      // 集計
      const summary = votes.reduce((acc, vote) => {
        acc[vote.content] = (acc[vote.content] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 全接続を取得
      const connections = await dynamoDBService.getAllConnections();

      // ブロードキャストメッセージを作成
      const message: VoteUpdateMessage = {
        type: 'VOTE_UPDATE',
        data: {
          key,
          totalCount: votes.length,
          summary,
        },
      };

      // 全接続にメッセージを送信
      const sendPromises = connections.map(connection =>
        this.sendMessageToConnection(event, connection.connectionId, message)
      );

      await Promise.allSettled(sendPromises);

      console.log(`Broadcasted vote update for key: ${key} to ${connections.length} connections`);
    } catch (error) {
      console.error('Failed to broadcast vote update:', error);
      throw error;
    }
  }
}

export const webSocketService = new WebSocketService();
