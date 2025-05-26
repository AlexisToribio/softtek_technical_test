import axios from 'axios';
import * as dotenv from 'dotenv';
import { HistoryResponse, MergedRespone, StoreResponse } from '../../src/models';

dotenv.config();

const baseURL = process.env.API_BASE_URL || '';

describe('API Integration Tests', () => {
	describe('GET /v1/fusionados', () => {
		test('It should return merged data for Luke', async () => {
			const response = await axios.get<MergedRespone>(`${baseURL}/v1/fusionados`, {
				params: { name: 'Luke' },
			});

			expect(response.status).toBe(200);
			expect(response.data).toHaveProperty('characterName', 'Luke Skywalker');
			expect(response.data).toHaveProperty('homePlanet', 'Tatooine');
			expect(response.data).toHaveProperty('similarTo', '23 Librae b');
			expect(response.data).toHaveProperty('comparison');
			expect(response.data.comparison).toHaveProperty('orbitalPeriod');
			expect(response.data.comparison.orbitalPeriod).toHaveProperty('fictitious', '304');
			expect(response.data.comparison.orbitalPeriod).toHaveProperty('real', '258.18');
			expect(response.data).toHaveProperty('timestamp');
		});
	});

	describe('POST /v1/almacenar', () => {
		test('It should store merged data', async () => {
			const dataToStore = {
				userId: 'test-user-123',
				name: 'Luke',
				homeworld: 'Tatooine',
			};

			const response = await axios.post<StoreResponse>(`${baseURL}/v1/almacenar`, dataToStore);

			expect(response.status).toBe(201);
			expect(response.data).toHaveProperty('message', 'Item stored successfully');
		});
	});

	describe('GET /v1/historial', () => {
		test('It should return stored history', async () => {
			const response = await axios.get<HistoryResponse>(`${baseURL}/v1/historial`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.data.items)).toBe(true);
			expect(response.data.items.length).toBeGreaterThan(0);
		});
	});
});
