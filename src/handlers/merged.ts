import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import axios from 'axios';
import { Planet, SwapiPeople, SwapiPlanet, SwapiResponse } from '../models';

const ddb = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME || '';
const SWAPI_API_URL = process.env.SWAPI_API_URL || '';
const PLANETS_API_URL = process.env.PLANETS_API_URL || '';
const PLANETS_API_KEY = process.env.PLANETS_API_KEY || '';

export const handler: APIGatewayProxyHandler = async (event) => {
	try {
		const characterName = event.queryStringParameters?.name;
		console.log('Received character name:', characterName);
		if (!characterName) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Missing required parameter: name' }),
			};
		}

		const cacheKey = `fusionados#${characterName}`;

		// 1. Buscar en cache
		const cachedRes = await ddb.send(
			new GetItemCommand({
				TableName: TABLE_NAME,
				Key: {
					id: { S: cacheKey },
					createdAt: { S: 'cache' },
				},
			})
		);

		if (cachedRes.Item && cachedRes.Item.data) {
			console.log('Cached data:', JSON.stringify(cachedRes.Item.data.S));
			return {
				statusCode: 200,
				body: cachedRes.Item.data.S || '{}',
			};
		}

		// 2. Obtener de personaje y planeta natal de SWAPI
		const swapiRes = await axios.get<SwapiResponse<SwapiPeople[]>>(
			`${SWAPI_API_URL}/people/?name=${encodeURIComponent(characterName)}`
		);
		console.log('Character response:', JSON.stringify(swapiRes.data));
		const character = swapiRes.data.result[0];
		if (!character) return { statusCode: 404, body: JSON.stringify({ error: 'Character not found' }) };

		const homeworld = await axios.get<SwapiResponse<SwapiPlanet>>(character.properties.homeworld);
		const fictitiousPlanet = homeworld.data;
		console.log('Homeworld response:', JSON.stringify(fictitiousPlanet));

		// 3. Obtener planetas reales según el periodo orbital
		const planetsRes = await axios.get<Planet[]>(`${PLANETS_API_URL}/planets`, {
			headers: { 'x-api-key': PLANETS_API_KEY },
			params: { max_period: fictitiousPlanet.result.properties.orbital_period },
		});
		console.log('Planets response:', JSON.stringify(planetsRes.data));

		if (planetsRes.data?.length === 0) {
			return {
				statusCode: 404,
				body: JSON.stringify({ error: 'No similar planet found' }),
			};
		}

		const planet = planetsRes.data[0];
		const now = new Date();
		const fusionado = {
			characterName: character.properties.name,
			homePlanet: fictitiousPlanet.result.properties.name,
			similarTo: planet.name,
			comparison: {
				orbitalPeriod: {
					fictitious: fictitiousPlanet.result.properties.orbital_period,
					real: `${planet.period}`,
				},
			},
			timestamp: now.toISOString(),
		};

		const serialized = JSON.stringify(fusionado);
		console.log('Fusionado result:', serialized);

		// 4. Guardar en cache (TTL 30 min)
		await ddb.send(
			new PutItemCommand({
				TableName: TABLE_NAME,
				Item: {
					id: { S: cacheKey },
					createdAt: { S: 'cache' },
					type: { S: 'cache' },
					data: { S: serialized },
					expiresAt: { N: `${Math.floor(Date.now() / 1000) + 60 * 30}` },
				},
			})
		);

		// 5. Guardar en historial
		await ddb.send(
			new PutItemCommand({
				TableName: TABLE_NAME,
				Item: {
					id: { S: cacheKey },
					createdAt: { S: now.toISOString() },
					type: { S: 'fusion' },
					data: { S: serialized },
				},
			})
		);

		return {
			statusCode: 200,
			body: serialized,
		};
	} catch (err: any) {
		console.error('Error GET /fusionados:', err);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Internal server error' }),
		};
	}
};
