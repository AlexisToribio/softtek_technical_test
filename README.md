# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

---

## API Base

La URL base para todas las peticiones es:

```
https://5uqw9h2nde.execute-api.us-east-1.amazonaws.com/api/v1
```

---

## Endpoints

### `GET /fusionados`

Fusiona datos de un personaje de Star Wars con un planeta real.

**Parámetros de consulta:**

- `name` (string, requerido): Character's name

**Respuestas:**

- `200`: Datos fusionados correctamente (`MergedResponse`)
- `400`: Falta parámetro requerido
- `404`: Personaje o planeta no encontrado

---

### `POST /almacenar`

Almacena datos personalizados.

**Body (application/json):**

```json
{
	"userId": "string"
	// Cualquier propiedad adicional personalizada
}
```

**Respuestas:**

- `201`: Ítem almacenado exitosamente (`StoreResponse`)
- `400`: Falta campo requerido

---

### `GET /historial`

Obtiene el historial de datos almacenados.

**Respuestas:**

- `200`: Historial de datos fusionados (`HistoryResponse`)

---

## Esquemas de Respuesta

### `MergedResponse`

```json
{
	"characterName": "string",
	"homePlanet": "string",
	"similarTo": "string",
	"comparison": {
		"orbitalPeriod": {
			"fictitious": "string",
			"real": "string"
		}
	},
	"timestamp": "string"
}
```

### `StoreResponse`

```json
{
	"message": "string",
	"itemId": "string"
}
```

### `HistoryResponse`

```json
{
	"items": [
		{
			"createdAt": "string",
			"data": {
				"characterName": "string",
				"homePlanet": "string",
				"similarTo": "string",
				"comparison": {
					"orbitalPeriod": {
						"fictitious": "string",
						"real": "string"
					}
				},
				"timestamp": "string"
			}
		}
	]
}
```
