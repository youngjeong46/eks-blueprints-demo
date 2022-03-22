import { ArnPrincipal } from '@aws-cdk/aws-iam';
import { ApplicationTeam } from '@aws-quickstart/ssp-amazon-eks';

export class TeamApplication extends ApplicationTeam {
    constructor(name: string, accountID: string) {
        super({
            name: name,
            userRoleArn: `arn:aws:iam::${accountID}:role/team-${name}-role`,
            // users:[new ArnPrincipal("app-team-user-1"), new ArnPrincipal("app-team-user-2")],
        });
    }
}