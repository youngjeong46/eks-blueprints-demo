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
        },
        {
            id: "mng2-custom",
            instanceTypes: [new ec2.InstanceType('m5.2xlarge')],
            nodeGroupCapacityType: eks.CapacityType.SPOT,
            customAmi: {
              machineImage: ec2.MachineImage.genericLinux({
                  'us-east-1': 'ami-0e1b6f116a3733fef',
                  'us-west-1': 'ami-0167be2eb86ccfbb6',
                  'us-east-2': 'ami-0656dd273bd6e9a2f'
              }),
            }
        }
      ]
    });

    const blueprint = blueprints.EksBlueprint.builder()
    .account(props?.env?.account)
    .clusterProvider(clusterProvider)
    .region(props?.env?.region)
    .addOns()
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