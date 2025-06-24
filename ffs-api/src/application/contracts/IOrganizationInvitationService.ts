import { AcceptOrganizationInviteResponse } from '../../interfaces/responses/organizations/AcceptOrganizationInviteResponse';

export interface IOrganizationInvitationService {
  acceptInvitation(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    token: string
  ): Promise<AcceptOrganizationInviteResponse>;
}
