import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as blueprints from '@aws-quickstart/ssp-amazon-eks';
import { TeamPlatform, TeamApplication } from '../teams';

export default class PipelineConstruct extends cdk.Construct{
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps){
    super(scope,id)

    // Customized Cluster Provider
    const clusterProvider = new blueprints.GenericClusterProvider({
      version: eks.KubernetesVersion.V1_21,
      managedNodeGroups: [
        {
            id: "mng1",
            amiType: eks.NodegroupAmiType.AL2_X86_64,
            instanceTypes: [new ec2.InstanceType('m5.2xlarge')]
        }
      ]
    });

    const blueprint = blueprints.EksBlueprint.builder()
    .account(props?.env?.account)
    .clusterProvider(clusterProvider)
    .region(props?.env?.region)
    .addOns(new blueprints.ContainerInsightsAddOn())
    .teams(new TeamPlatform(), new TeamApplication('burnham'), new TeamApplication('carmen'));

    const repoUrl = 'https://github.com/aws-samples/ssp-eks-workloads.git'

    const bootstrapRepo : blueprints.ApplicationRepository = {
        repoUrl,
        targetRevision: 'workshop',
    }

    // HERE WE GENERATE THE ADDON CONFIGURATIONS
    const devBootstrapArgo = new blueprints.ArgoCDAddOn({
      bootstrapRepo: {
          ...bootstrapRepo,
          path: 'envs/dev'
      },
    });
    const testBootstrapArgo = new blueprints.ArgoCDAddOn({
        bootstrapRepo: {
            ...bootstrapRepo,
            path: 'envs/test'
        },
    });
    const prodBootstrapArgo = new blueprints.ArgoCDAddOn({
        bootstrapRepo: {
            ...bootstrapRepo,
            path: 'envs/prod'
        },
    });
  
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
          { id: "dev", stackBuilder: blueprint.clone('us-west-2').addOns(devBootstrapArgo)},
          { id: "test", stackBuilder: blueprint.clone('us-east-2').addOns(testBootstrapArgo)},
          { id: "prod", stackBuilder: blueprint.clone('us-east-1').addOns(prodBootstrapArgo)}
        ]
      })
      .build(scope, id+'-stack', props);
  }
}