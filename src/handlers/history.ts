import { DynamoDBClient, ScanCommand, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		const queryParams = event.queryStringParameters || {};
		console.log('Received query parameters:', JSON.stringify(queryParams));
		const limit = parseInt(queryParams?.limit || '10', 10);
		const lastKey = queryParams?.lastKey;

		const input: ScanCommandInput = {
			TableName: TABLE_NAME,
			FilterExpression: '#t = :fusion',
			ExpressionAttributeNames: {
				'#t': 'type',
			},
			ExpressionAttributeValues: {
				':fusion': { S: 'fusion' },
			},
			Limit: limit,
			...(lastKey && {
				ExclusiveStartKey: JSON.parse(Buffer.from(lastKey, 'base64').toString()),
			}),
		};

		const result = await dynamo.send(new ScanCommand(input));

		const sortedItems = (result.Items || [])
			.map((item) => ({
				createdAt: item.createdAt.S!,
				data: JSON.parse(item.data.S || '{}'),
			}))
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return {
			statusCode: 200,
			body: JSON.stringify({
				items: sortedItems,
				lastKey: result.LastEvaluatedKey
					? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
					: null,
			}),
		};
	} catch (error) {
		console.error('Error fetching historial:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Internal server error' }),
		};
	}
};
