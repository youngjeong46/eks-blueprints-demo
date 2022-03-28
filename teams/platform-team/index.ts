import { ArnPrincipal } from 'aws-cdk-lib/aws-iam';
import { PlatformTeam } from '@aws-quickstart/eks-blueprints';

export class TeamPlatform extends PlatformTeam {
    constructor(accountID: string) {
        super({
            name: "platform",
            userRoleArn: `arn:aws:iam::${accountID}:role/platform-team-role`,
            // users:[new ArnPrincipal("platform-user-1"), new ArnPrincipal("platform-user-2")],
        })
    }
}

