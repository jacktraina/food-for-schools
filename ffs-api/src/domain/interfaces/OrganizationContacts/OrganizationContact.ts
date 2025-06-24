import { Contact } from "../Contacts/Contact";
import { District } from "../Districts/District";
import { OrganizationType } from "../organizationTypes/OrganizationType";

export interface IOrganizationContactProps {
  id?: number;
  contactId: number;
  organizationId: number;
  organizationTypeId: number;
  rank: number;
  districtId?: number;
  contact?: Contact;
  district?: District;
  organizationType?: OrganizationType;
}

export class OrganizationContact {
  id?: number;
  contactId: number;
  organizationId: number;
  organizationTypeId: number;
  rank: number;
  districtId?: number;
  contact?: Contact;
  district?: District;
  organizationType?: OrganizationType;

  constructor(props: IOrganizationContactProps) {
    this.id = props.id;
    this.contactId = props.contactId;
    this.organizationId = props.organizationId;
    this.organizationTypeId = props.organizationTypeId;
    this.rank = props.rank;
    this.districtId = props.districtId;
    this.contact = props.contact;
    this.district = props.district;
    this.organizationType = props.organizationType;

    OrganizationContact.validateContactId(this.contactId);
    OrganizationContact.validateOrganizationId(this.organizationId);
    OrganizationContact.validateRank(this.rank);
  }

  static validateContactId(contactId: number): void {
    if (!Number.isInteger(contactId) || contactId <= 0) {
      throw new Error('contactId must be a positive integer');
    }
  }

  static validateOrganizationId(organizationId: number): void {
    if (!Number.isInteger(organizationId) || organizationId <= 0) {
      throw new Error('organizationId must be a positive integer');
    }
  }

  static validateRank(rank: number): void {
    if (!Number.isInteger(rank) || rank < 0) {
      throw new Error('rank must be a non-negative integer');
    }
  }
}
