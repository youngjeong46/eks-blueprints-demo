import * as cdk from '@aws-cdk/core';
import * as blueprints from '@aws-quickstart/ssp-amazon-eks';
import { TeamPlatform, TeamApplication } from '../teams';

export default class PipelineConstruct extends cdk.Construct{
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps){
    super(scope,id)

    // use Custom AMI, Instance Type, etc.
    const blueprint = blueprints.EksBlueprint.builder()
    .account(props?.env?.account)
    .region(props?.env?.region)
    .addOns(new blueprints.ContainerInsightsAddOn())
    .teams(new TeamPlatform(), new TeamApplication('burnham'));
  
    blueprints.CodePipelineStack.builder()
      .name("blueprints-demo-pipeline")
      .owner("youngjeong46")
      .repository({
          repoUrl: 'eks-blueprints-demo',
          credentialsSecretName: 'github-token',
          targetRevision: 'main'
      })
      .wave({
        id: "envs",
        stages: [
          { id: "dev", stackBuilder: blueprint.clone('us-west-1')},
          { id: "test", stackBuilder: blueprint.clone('us-east-2')},
          { id: "prod", stackBuilder: blueprint.clone('us-east-1')}
        ]
      })
      .build(scope, id+'-stack', props);
  }
}