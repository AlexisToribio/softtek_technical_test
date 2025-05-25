import axios from 'axios';

const SWAPI_API_URL = process.env.SWAPI_API_URL || '';

describe('Integration swapi', () => {
	test('It should get character by name from swapi', async () => {
		const response = await axios.get(`${SWAPI_API_URL}/people/?name=luke%20skywalker`);
		expect(response.status).toBe(200);
		expect(response.data).toHaveProperty('result');
		expect(response.data.result.length).toBeGreaterThan(0);
		expect(response.data.result[0].properties).toHaveProperty('name', 'Luke Skywalker');
		expect(response.data.result[0].properties).toHaveProperty('homeworld');
	});

	test('It should get the homeworld of character', async () => {
		const charRes = await axios.get(`${SWAPI_API_URL}/people/?name=Leia%20Organa`);
		const planetUrl = charRes.data.result[0].properties.homeworld;
		const planetRes = await axios.get(planetUrl);
		console.log(JSON.stringify(planetRes.data));
		const res = await axios.get('https://www.swapi.tech/api/planets/5');
		console.log(JSON.stringify(res.data));
		expect(planetRes.status).toBe(200);
		expect(planetRes.data.result.properties.name).toBeDefined();
	});
});
