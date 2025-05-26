import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { createName } from '../utils/functions';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class SofttekStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// Table for storing merged data
		const table = new dynamodb.Table(this, 'SofttekTable', {
			tableName: createName('table', 'softtek'),
			partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		const environment = {
			TABLE_NAME: table.tableName,
			SWAPI_API_URL: process.env.SWAPI_API_URL || '',
			PLANETS_API_URL: process.env.PLANETS_API_URL || '',
			PLANETS_API_KEY: process.env.PLANETS_API_KEY || '',
		};

		const optionsLambda = {
			architecture: lambda.Architecture.X86_64,
			runtime: lambda.Runtime.NODEJS_20_X,
			timeout: Duration.seconds(10),
			memorySize: 128,
			retryAttempts: 0,
			tracing: lambda.Tracing.ACTIVE,
			bundling: {
				externalModules: ['aws-sdk'],
			},
		};

		// Lambda function to handle fusionados
		const mergedLambda = new NodejsFunction(this, 'MergedHandler', {
			functionName: createName('lambda', 'merged'),
			description: 'Lambda function to handle fusionados',
			entry: path.join(__dirname, '../src/handlers/merged.ts'),
			handler: 'handler',
			environment,
			...optionsLambda,
		});

		const storeLambda = new NodejsFunction(this, 'StoreHandler', {
			functionName: createName('lambda', 'store'),
			description: 'Lambda function to handle almacenar',
			entry: path.join(__dirname, '../src/handlers/store.ts'),
			handler: 'handler',
			environment,
			...optionsLambda,
		});

		const historyLambda = new NodejsFunction(this, 'HistoryHandler', {
			functionName: createName('lambda', 'history'),
			description: 'Lambda function to handle historial',
			entry: path.join(__dirname, '../src/handlers/history.ts'),
			handler: 'handler',
			environment,
			...optionsLambda,
		});

		table.grantReadWriteData(mergedLambda);
		table.grantReadWriteData(storeLambda);
		table.grantReadWriteData(historyLambda);

		// Log group for API Gateway
		const apiLogGroup = new LogGroup(this, 'ApiSofttekLogGroup', {
			logGroupName: createName('cw', 'apigw-logs'),
			retention: RetentionDays.ONE_DAY,
			removalPolicy: RemovalPolicy.DESTROY,
		});

		const api = new apigateway.RestApi(this, 'SofttekApi', {
			restApiName: createName('apigw', 'softtek-api'),
			deploy: true,
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
				allowMethods: apigateway.Cors.ALL_METHODS,
			},
			description: 'Api to handle technical test for Softtek',
			cloudWatchRole: true,
			cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
			deployOptions: {
				accessLogDestination: new apigateway.LogGroupLogDestination(apiLogGroup),
				accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
				loggingLevel: apigateway.MethodLoggingLevel.INFO,
				metricsEnabled: true,
				stageName: 'api',
				tracingEnabled: true,
				throttlingRateLimit: 100,
				throttlingBurstLimit: 500,
			},
		});

		const v1 = api.root.addResource('v1');
		v1.addResource('fusionados').addMethod('GET', new apigateway.LambdaIntegration(mergedLambda));
		v1.addResource('almacenar').addMethod('POST', new apigateway.LambdaIntegration(storeLambda));
		v1.addResource('historial').addMethod('GET', new apigateway.LambdaIntegration(historyLambda));
	}
}
