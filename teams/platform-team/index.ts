import { ArnPrincipal } from '@aws-cdk/aws-iam';
import { PlatformTeam } from '@aws-quickstart/ssp-amazon-eks';

export class TeamPlatform extends PlatformTeam {
    constructor() {
        super({
            name: "platform",
            userRoleArn: "arn:aws:iam::590259161827:role/platform-team-role",
            // users:[new ArnPrincipal("arn-user-1"), new ArnPrincipal("arn-user-2")],
        })
    }
}

