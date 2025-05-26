import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { handler } from '../../src/handlers/store';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

jest.mock('uuid', () => ({
	v4: jest.fn(() => 'mock-uuid'),
}));

const mockSend = jest.fn().mockResolvedValueOnce(Promise.resolve({}));

jest.mock('@aws-sdk/client-dynamodb', () => {
	const actual = jest.requireActual('@aws-sdk/client-dynamodb');
	return {
		...actual,
		DynamoDBClient: jest.fn().mockImplementation(() => ({
			send: jest.fn((command) => {
				if (command instanceof PutItemCommand) return Promise.resolve(mockSend);
				return Promise.resolve({});
			}),
		})),
		PutItemCommand: actual.PutItemCommand,
	};
});

const context = {} as Context;
const callback = jest.fn();

describe('POST /Almacenar', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should return 201 when data is stored successfully', async () => {
		const event = {
			body: JSON.stringify({
				userId: 'user123',
				key1: 'value1',
				key2: 'value2',
			}),
		} as unknown as APIGatewayProxyEvent;

		const response = await handler(event, context, callback);

		expect(response?.statusCode).toBe(201);
		const body = JSON.parse(response?.body || '{}');
		expect(body.message).toBe('Item stored successfully');
		expect(body.itemId).toBe('mock-uuid');
	});

	test('should return 400 if userId is missing', async () => {
		const event = {
			body: JSON.stringify({
				key1: 'value1',
			}),
		} as unknown as APIGatewayProxyEvent;

		const response = await handler(event, context, callback);

		expect(response?.statusCode).toBe(400);
		const body = JSON.parse(response?.body || '{}');
		expect(body.error).toBe('Missing required field: userId');
	});
});
