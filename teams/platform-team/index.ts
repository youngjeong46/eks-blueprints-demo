import { ArnPrincipal } from '@aws-cdk/aws-iam';
import { PlatformTeam } from '@aws-quickstart/ssp-amazon-eks';

export class TeamPlatform extends PlatformTeam {
    constructor(accountID: string) {
        super({
            name: "platform",
            userRoleArn: `arn:aws:iam::${accountID}:role/platform-team-role`,
            // users:[new ArnPrincipal("platform-user-1"), new ArnPrincipal("platform-user-2")],
        })
    }
}

