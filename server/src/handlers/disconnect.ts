import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDBService } from '../services/dynamodb';
import { createWebSocketResponse } from '../utils/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket disconnect event:', JSON.stringify(event, null, 2));

  try {
    const connectionId = event.requestContext.connectionId!;

    // 接続情報を DynamoDB から削除
    await dynamoDBService.deleteConnection(connectionId);

    console.log(`Connection deleted: ${connectionId}`);

    return createWebSocketResponse(200);
  } catch (error) {
    console.error('Error handling disconnect:', error);
    return createWebSocketResponse(500);
  }
};
