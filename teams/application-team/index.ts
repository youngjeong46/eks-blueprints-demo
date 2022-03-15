import { ArnPrincipal } from '@aws-cdk/aws-iam';
import { ApplicationTeam } from '@aws-quickstart/ssp-amazon-eks';

export class TeamApplication extends ApplicationTeam {
    constructor(name: string) {
        super({
            name: name,
            users: [new ArnPrincipal(`arn:aws:iam:590259161827:user/platform`)],
            userRoleArn: "arn:aws:iam::590259161827:role/application-team-role"
        });
    }
}