#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SofttekStack } from '../lib/softtek-stack';
import { createName } from '../utils/functions';
import * as dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();
const softtekStack = new SofttekStack(app, createName('stack', 'technical-test'), {});

cdk.Tags.of(softtekStack).add('project', 'softtek');
