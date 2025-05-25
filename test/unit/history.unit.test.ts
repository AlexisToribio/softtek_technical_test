import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../src/handlers/history';
import { ScanCommand } from '@aws-sdk/client-dynamodb';

let mockSend = {};

jest.mock('@aws-sdk/client-dynamodb', () => {
	const originalModule = jest.requireActual('@aws-sdk/client-dynamodb');
	return {
		...originalModule,
		DynamoDBClient: jest.fn().mockImplementation(() => ({
			send: jest.fn((command) => {
				if (command instanceof ScanCommand) return Promise.resolve(mockSend);
				return Promise.resolve({});
			}),
		})),
	};
});

const event = {
	queryStringParameters: { limit: '2' },
} as unknown as APIGatewayProxyEvent;

const context = {} as Context;
const callback = jest.fn();

describe('GET /historial', () => {
	beforeEach(() => {});

	test('It must return correctly ordered items', async () => {
		const mockItems = [
			{
				createdAt: { S: '2025-05-23T10:00:00Z' },
				data: { S: JSON.stringify({ message: 'Fusion 1' }) },
			},
			{
				createdAt: { S: '2025-05-23T11:00:00Z' },
				data: { S: JSON.stringify({ message: 'Fusion 2' }) },
			},
		];

		mockSend = {
			Items: mockItems,
			LastEvaluatedKey: { id: { S: 'fusionados#Luke' }, createdAt: { S: '2025-05-23T11:00:00Z' } },
		};

		const response = await handler(event, context, callback);

		expect(response?.statusCode).toBe(200);
		const body = JSON.parse(response?.body || '{}');
		expect(body.items.length).toBe(2);
		expect(body.items[0].data.message).toBe('Fusion 2');
	});
});
