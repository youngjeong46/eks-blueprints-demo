# EKS Blueprints Demo

This is a node/typescript project with demo for EKS Blueprints. The repo contains the following:

- Implementation of a blueprint for an EKS cluster with managed nodegroups, target region, AWS accounts, defined platform/application teams, and add-ons.
- Provisioning of EKS clusters with the blueprint in 3 different regions using CI/CD Pipelines (AWS CDK Pipelines).
- Workloads deployed using ArgoCD GitOps in the application team namespaces.

## Prerequisites

1. aws-cdk v2.17.0.
2. `kubectl` for CLI access to your EKS clusters.
3. You must have your GitHub token stored as a secret named `github-token` on AWS Secrets Manager in the following regions: us-east-1, us-east-2 and us-west-2. (Create in one region and replicate to the rest).
4. There needs to be three IAM Roles generated in your AWS account - `team-burnham-role`, `team-carmen-role` and `platform-team-role`. They don't need to have any policies attached, but be sure to have a trust policy that allows you to assume those roles using other entities.
  
## How to deploy

1. Run `npm i` to install all dependencies.
2. Run `cdk deploy pipeline-stack` to deploy the pipeline in your AWS Account, with cross-region support stacks in `us-west-2` and `us-east-2`.
3. The pipeline should deploy all the clusters automatically.
4. To retrieve kubeconfig for testing purposes, you should run the following command (for `dev-blueprint` cluster in `us-west-2`):

```
export KUBE_CONFIG=$(aws cloudformation describe-stacks --stack-name dev-dev-blueprint | jq -r '.Stacks[0].Outputs[] | select(.OutputKey|match("ConfigCommand"))| .OutputValue')
$KUBE_CONFIG
```
