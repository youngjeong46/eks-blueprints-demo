import { ArnPrincipal } from '@aws-cdk/aws-iam';
import { PlatformTeam } from '@aws-quickstart/ssp-amazon-eks';

export class TeamPlatform extends PlatformTeam {
    constructor() {
        super({
            name: "platform",
            users: [new ArnPrincipal(`arn:aws:iam:590259161827:user/platform`)],
            userRoleArn: "arn:aws:iam::590259161827:role/platform-team-role",
        })
    }
}