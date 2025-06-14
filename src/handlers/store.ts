import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const tableName = process.env.TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		const body = JSON.parse(event.body || '{}');
		const { userId, ...rest } = body;
		console.log('Received body:', JSON.stringify(body));

		if (!userId) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Missing required field: userId' }),
			};
		}

		const createdAt = new Date().toISOString();

		const item = {
			id: { S: `customdata#${userId}` },
			createdAt: { S: createdAt },
			type: { S: 'custom' },
			uuid: { S: uuidv4() },
			data: { S: JSON.stringify(rest) },
		};

		await client.send(
			new PutItemCommand({
				TableName: tableName,
				Item: item,
			})
		);

		return {
			statusCode: 201,
			body: JSON.stringify({
				message: 'Item stored successfully',
				itemId: item.uuid.S,
			}),
		};
	} catch (err) {
		console.error('Error POST /almacenar:', err);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Internal server error' }),
		};
	}
};
