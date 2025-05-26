import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		const queryParams = event.queryStringParameters || {};
		console.log('Received query parameters:', JSON.stringify(queryParams));
		const limit = parseInt(queryParams?.limit || '10', 10);
		const lastKey = queryParams?.lastKey;

		const input: QueryCommandInput = {
			TableName: TABLE_NAME,
			IndexName: 'view-type-index',
			KeyConditionExpression: '#t = :fusion',
			ExpressionAttributeNames: { '#t': 'type' },
			ExpressionAttributeValues: { ':fusion': { S: 'fusion' } },
			Limit: limit,
			ScanIndexForward: false,
			...(lastKey && {
				ExclusiveStartKey: JSON.parse(Buffer.from(lastKey, 'base64').toString()),
			}),
		};

		const result = await dynamo.send(new QueryCommand(input));

		const items = (result.Items || []).map((item) => ({
			createdAt: item.createdAt.S!,
			data: JSON.parse(item.data.S || '{}'),
		}));

		return {
			statusCode: 200,
			body: JSON.stringify({
				items: items,
				lastKey: result.LastEvaluatedKey
					? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
					: null,
			}),
		};
	} catch (error) {
		console.error('Error GET /historial:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Internal server error' }),
		};
	}
};
