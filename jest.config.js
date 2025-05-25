const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
};
