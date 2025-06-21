import { DynamoDBClient, PutItemCommand, QueryCommand, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { VoteItem, ConnectionItem, Vote } from '../models/vote';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });

const VOTES_TABLE = process.env.VOTES_TABLE!;
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!;

export class DynamoDBService {
  // 投票を保存
  async saveVote(vote: VoteItem): Promise<void> {
    const command = new PutItemCommand({
      TableName: VOTES_TABLE,
      Item: marshall(vote),
    });

    await client.send(command);
  }

  // 特定キーの全投票を取得
  async getVotesByKey(key: string): Promise<Vote[]> {
    const command = new QueryCommand({
      TableName: VOTES_TABLE,
      KeyConditionExpression: '#key = :key',
      ExpressionAttributeNames: {
        '#key': 'key',
      },
      ExpressionAttributeValues: marshall({
        ':key': key,
      }),
      ScanIndexForward: true, // voteId でソート
    });

    const result = await client.send(command);
    const items = result.Items || [];
    return items.map(item => unmarshall(item)) as Vote[];
  }

  // 特定キーの投票結果サマリーを取得
  async getVoteSummaryByKey(key: string): Promise<{key: string, summary: Record<string, number>, totalCount: number} | null> {
    const votes = await this.getVotesByKey(key);

    if (votes.length === 0) {
      return null;
    }

    const summary: Record<string, number> = {};
    votes.forEach(vote => {
      summary[vote.content] = (summary[vote.content] || 0) + 1;
    });

    return {
      key,
      summary,
      totalCount: votes.length
    };
  }

  // 接続を保存
  async saveConnection(connection: ConnectionItem): Promise<void> {
    const command = new PutItemCommand({
      TableName: CONNECTIONS_TABLE,
      Item: marshall(connection),
    });

    await client.send(command);
  }

  // 接続を削除
  async deleteConnection(connectionId: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: CONNECTIONS_TABLE,
      Key: marshall({
        connectionId,
      }),
    });

    await client.send(command);
  }

  // 投票を削除
  async deleteVote(key: string, voteId: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: VOTES_TABLE,
      Key: marshall({
        key,
        voteId,
      }),
    });

    await client.send(command);
  }

  // 複数の投票を削除
  async deleteVotesByIds(key: string, voteIds: string[]): Promise<void> {
    const deletePromises = voteIds.map(voteId =>
      this.deleteVote(key, voteId)
    );

    await Promise.all(deletePromises);
  }

  // 全接続を取得
  async getAllConnections(): Promise<ConnectionItem[]> {
    const command = new ScanCommand({
      TableName: CONNECTIONS_TABLE,
    });

    const result = await client.send(command);
    const items = result.Items || [];
    return items.map(item => unmarshall(item)) as ConnectionItem[];
  }
}

export const dynamoDBService = new DynamoDBService();
