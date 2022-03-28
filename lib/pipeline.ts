import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs';
import { TeamPlatform, TeamApplication } from '../teams';

export default class PipelineConstruct extends Construct{
  constructor(scope: Construct, id: string, props?: cdk.StackProps){
    super(scope,id)

    // Customized Cluster Provider
    const clusterProvider = new blueprints.GenericClusterProvider({
      version: eks.KubernetesVersion.V1_21,
      managedNodeGroups: [
        {
          id: "mng-1",
          minSize: 1,
          maxSize: 5,
          desiredSize: 2,
          amiType: eks.NodegroupAmiType.AL2_X86_64,
          instanceTypes: [new ec2.InstanceType('m5.2xlarge')],
          nodeGroupCapacityType: eks.CapacityType.ON_DEMAND,
        },
        {
          id: "spot-1",
          instanceTypes: [
            new ec2.InstanceType('t2.xlarge'),
            new ec2.InstanceType('t3.xlarge'),
            new ec2.InstanceType('t3.small'),
          ],
          nodeGroupCapacityType: eks.CapacityType.SPOT,
        }
      ],
      autoscalingNodeGroups: [
        {
          id: "self-1", 
          minSize: 1,
          maxSize: 3,
          desiredSize: 2,
          instanceType: new ec2.InstanceType('t2.xlarge'),
        }
      ]
    });

    const account = props?.env?.account!;
    const region = props?.env?.account!;

    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .clusterProvider(clusterProvider)
    .region(region)
    .addOns(new blueprints.ContainerInsightsAddOn())
    .teams(
      new TeamPlatform(account), 
      new TeamApplication('burnham', account), 
      new TeamApplication('carmen', account)
    );

    const repoUrl = 'https://github.com/aws-samples/ssp-eks-workloads.git'

    const bootstrapRepo : blueprints.ApplicationRepository = {
        repoUrl,
        targetRevision: 'demo',
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