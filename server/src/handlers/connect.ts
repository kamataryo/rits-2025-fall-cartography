import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDBService } from '../services/dynamodb';
import { ConnectionItem } from '../models/vote';
import { createWebSocketResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket connection event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;

    // TTL を1時間後に設定
    const ttl = Math.floor(Date.now() / 1000) + 3600;

    const connection: ConnectionItem = {
      connectionId,
      ttl,
    };

    // 接続情報を DynamoDB に保存
    await dynamoDBService.saveConnection(connection);

    console.log(`Connection saved: ${connectionId}`);

    return createWebSocketResponse(200);
  } catch (error) {
    console.error('Error handling connection:', error);
    return createWebSocketResponse(500);
  }
};
