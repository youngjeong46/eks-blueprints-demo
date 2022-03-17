import * as cdk from '@aws-cdk/core';
import ClusterConstruct from '../lib/eks-blueprints-demo-stack';
import PipelineConstruct from '../lib/pipeline'; // IMPORT OUR PIPELINE CONSTRUCT


const app = new cdk.App();
const account = process.env.CDK_DEFAULT_ACCOUNT!;
const region = process.env.CDK_DEFAULT_REGION;
const env = { account, region }
//Define Custom AMI, Instance Type, etc. - Generic Cluster Provider

new ClusterConstruct(app, 'cluster', { env });
new PipelineConstruct(app, 'pipeline', { env });