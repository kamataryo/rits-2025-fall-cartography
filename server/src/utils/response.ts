import { APIGatewayProxyResult } from 'aws-lambda';

export const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
};

export const createSuccessResponse = (data: any): APIGatewayProxyResult => {
  return createResponse(200, { success: true, data });
};

export const createErrorResponse = (statusCode: number, message: string): APIGatewayProxyResult => {
  return createResponse(statusCode, { success: false, error: message });
};

// WebSocket レスポンス用
export const createWebSocketResponse = (statusCode: number): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    },
    body: '',
  };
};
