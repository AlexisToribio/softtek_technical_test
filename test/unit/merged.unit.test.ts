import { handler } from '../../src/handlers/merged';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import axios from 'axios';

// Mockeamos el cliente de DynamoDB
jest.mock('@aws-sdk/client-dynamodb', () => {
	const originalModule = jest.requireActual('@aws-sdk/client-dynamodb');
	return {
		...originalModule,
		DynamoDBClient: jest.fn().mockImplementation(() => ({
			send: jest.fn((command) => {
				// Devuelve vacío para simular que no hay caché
				if (command instanceof GetItemCommand) return Promise.resolve({});
				if (command instanceof PutItemCommand) return Promise.resolve({});
				return Promise.resolve({});
			}),
		})),
	};
});

// Mockeamos axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GET /fusionados', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('It must merge data when there is no cache', async () => {
		mockedAxios.get
			.mockResolvedValueOnce({
				data: {
					result: [
						{
							properties: {
								name: 'Luke Skywalker',
								homeworld: 'https://swapi.tech/api/planets/1/',
							},
						},
					],
				},
			})
			.mockResolvedValueOnce({
				data: {
					result: {
						properties: {
							name: 'Alderaan',
							orbital_period: '364',
						},
					},
				},
			})
			.mockResolvedValueOnce({
				data: [
					{
						name: '23 Librae b',
						period: 258.18,
					},
				],
			});

		const event: APIGatewayProxyEvent = {
			queryStringParameters: {
				name: 'Luke Skywalker',
			},
		} as unknown as APIGatewayProxyEvent;

		const context = {} as Context;
		const callback = jest.fn();
		const response = await handler(event, context, callback);

		expect(response?.statusCode).toBe(200);

		const body = JSON.parse(response?.body || '{}');
		expect(body.characterName).toBe('Luke Skywalker');
		expect(body.homePlanet).toBe('Alderaan');
		expect(body.similarTo).toBe('23 Librae b');
		expect(body.comparison).toHaveProperty('orbitalPeriod');
		expect(body.comparison.orbitalPeriod).toHaveProperty('fictitious');
		expect(body.comparison.orbitalPeriod).toHaveProperty('real');
		expect(body.comparison).toEqual({
			orbitalPeriod: {
				fictitious: '364',
				real: '258.18',
			},
		});
		expect(body.timestamp).toBeDefined();
		expect(mockedAxios.get).toHaveBeenCalledTimes(3);
	});
});
