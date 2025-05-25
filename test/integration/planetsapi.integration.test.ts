import axios from 'axios';

const PLANETS_API_URL = process.env.PLANETS_API_URL || '';
const PLANETS_API_KEY = process.env.PLANETS_API_KEY || '';

describe('Integration planetsapi', () => {
	test('It should get planets by orbital period from planetsapi', async () => {
		const response = await axios.get(`${PLANETS_API_URL}/planets?max_period=364`, {
			headers: { 'x-api-key': PLANETS_API_KEY },
		});

		console.log(JSON.stringify(response.data));
		expect(response.status).toBe(200);
		expect(Array.isArray(response.data)).toBe(true);
	});
});
