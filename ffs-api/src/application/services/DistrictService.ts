import { inject, injectable } from "inversify";
import TYPES from "../../shared/dependencyInjection/types";
import { BadRequestError } from "../../domain/core/errors/BadRequestError";
import { IDistrictRepository } from "../../domain/interfaces/Districts/IDistrictRepository";
import { IDistrictService } from "../contracts/IDistrictService";
import { District } from "../../domain/interfaces/Districts/District";
import { CreateDistrictRequest } from "../../interfaces/requests/district/CreateDistrictRequest";
import { IDistrictProductRepository } from "../../domain/interfaces/DistrictProducts/IDistrictProductRepository";
import { GetDistrictListResponse } from "../../interfaces/responses/district/GetDistrictListResponse";
import { UpdateDistrictRequestData } from "../../interfaces/requests/district/UpdateDistrictRequest";
import { UpdateDistrictResponse } from "../../interfaces/responses/district/UpdateDistrictResponse";
import { NotFoundError } from "../../domain/core/errors/NotFoundError";
import { ISchoolRepository } from "../../domain/interfaces/Schools/ISchoolRepository";
import { GetDistrictResponse } from "../../interfaces/responses/district/GetDistrictDetailsResponse";
import { DeactivateDistrictResponse } from "../../interfaces/responses/district/DeactivateDistrictResponse";
import { ActivateDistrictResponse } from "../../interfaces/responses/district/ActivateDistrictResponse";
import { DeleteDistrictResponse } from "../../interfaces/responses/district/DeleteDistrictResponse";
import { IContactRepository } from "../../domain/interfaces/Contacts/IContactRepository";
import { IOrganizationContactRepository } from "../../domain/interfaces/OrganizationContacts/IOrganizationContactRepository";
import { Contact, ContactType } from "../../domain/interfaces/Contacts/Contact";
import { OrganizationContact } from "../../domain/interfaces/OrganizationContacts/OrganizationContact";
import { IDatabaseService } from "../contracts/IDatabaseService";

@injectable()
export class DistrictService implements IDistrictService {
  constructor(
    @inject(TYPES.IDistrictRepository)
    private districtRepository: IDistrictRepository,
    @inject(TYPES.IDistrictProductRepository)
    private districtProductRepository: IDistrictProductRepository,
    @inject(TYPES.ISchoolRepository) private schoolRepository: ISchoolRepository,
    @inject(TYPES.IContactRepository) private contactRepository: IContactRepository,
    @inject(TYPES.IOrganizationContactRepository)
    private organizationContactRepository: IOrganizationContactRepository,
    @inject(TYPES.IDatabaseService) private databaseService: IDatabaseService
  ) {}

  async createDistrict(
    districtData: CreateDistrictRequest,
    statusId: number,
    organizationId: number
  ): Promise<District> {
    try {
      const districtCode = await this.generateNextDistrictCode();

      const result = await this.databaseService.runInTransaction(async (prisma) => {
        const district = District.create(districtData, statusId, organizationId, districtCode);

        const createdDistrict = await this.districtRepository.createWithTransaction(prisma, district);

        if (!createdDistrict?.id) {
          throw new Error("Failed to create district");
        }

        if (districtData.contact2 && (districtData.contact2Phone || districtData.contact2Email)) {
          const [firstName, ...lastNameParts] = districtData.contact2.split(" ");
          const lastName = lastNameParts.join(" ") || "Unknown";

          const secondaryContact = new Contact({
            firstName: firstName || "Unknown",
            lastName: lastName,
            phone: districtData.contact2Phone ?? null,
            email: districtData.contact2Email ?? null,
            contactType: ContactType.DEFAULT,
          });

          const createdSecondaryContact = await this.contactRepository.createWithTransaction(prisma, secondaryContact);

          if (createdSecondaryContact.id) {
            await this.organizationContactRepository.createWithTransaction(
              prisma,
              new OrganizationContact({
                contactId: createdSecondaryContact.id,
                organizationId: createdDistrict.id,
                organizationTypeId: 1,
                rank: 2,
                districtId: createdDistrict.id,
              })
            );
          }
        }

        if (districtData.billingContact && (districtData.billingPhone || districtData.billingEmail)) {
          const [firstName, ...lastNameParts] = districtData.billingContact.split(" ");
          const lastName = lastNameParts.join(" ") || "Unknown";

          const billingContact = new Contact({
            firstName: firstName || "Unknown",
            lastName: lastName,
            phone: districtData.billingPhone ?? null,
            email: districtData.billingEmail ?? null,
            address1: districtData.billingAddressLine1 ?? null,
            address2: districtData.billingAddressLine2 ?? null,
            city: districtData.billingCity ?? null,
            state: districtData.billingState ?? null,
            zipcode: districtData.billingZipCode ?? null,
            contactType: ContactType.BILLING,
          });

          const createdBillingContact = await this.contactRepository.createWithTransaction(prisma, billingContact);

          if (createdBillingContact.id) {
            await this.organizationContactRepository.createWithTransaction(
              prisma,
              new OrganizationContact({
                contactId: createdBillingContact.id,
                organizationId: createdDistrict.id,
                organizationTypeId: 1,
                rank: 1,
                districtId: createdDistrict.id,
              })
            );
          }
        }

        if (districtData.products && districtData.products.length > 0) {
          for (const product of districtData.products) {
            await this.districtProductRepository.createWithTransaction(prisma, {
              districtId: createdDistrict.id,
              productName: product,
            });
          }
        }

        return createdDistrict;
      });

      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error("Error in createDistrict:", error);
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError("Failed to create district");
    }
  }

  async getDistrictLists(cooperativeId: number): Promise<GetDistrictListResponse[]> {
    try {
      const districts = await this.districtRepository.findByCooperativeId(cooperativeId);

      const districtListWithCounts: GetDistrictListResponse[] = [];

      for (const district of districts) {
        const schools = await this.schoolRepository.findByDistrictIdWithStatus(district.id!);

        const totalStudents = schools.reduce((sum, school) => sum + (school.enrollment || 0), 0);

        const location =
          district.city && district.state
            ? `${district.city}, ${district.state}`
            : district.location;

        districtListWithCounts.push({
          id: district.id!,
          name: district.name ?? null,
          location: location ?? null,
          schools: schools.length,
          students: totalStudents,
          status: district.userStatus?.name ?? null,
        });
      }

      return districtListWithCounts;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError("Failed to retrieve districts");
    }
  }

  async updateDistrict(
    districtId: number,
    updateData: UpdateDistrictRequestData
  ): Promise<UpdateDistrictResponse> {
    try {
      const district = await this.districtRepository.findByIds(districtId);
      if (!district) {
        throw new NotFoundError("District");
      }

      const result = await this.databaseService.runInTransaction(async (prisma) => {
        const updateProps = District.mapUpdateRequestToProps(updateData);
        const updatedDistrict = district.update(updateProps);
        
        await this.districtRepository.updateWithTransaction(prisma, updatedDistrict);
        
        if (updateData.products && updateData.products.length > 0 && updatedDistrict.id) {
          await this.districtProductRepository.deleteByDistrictIdWithTransaction(prisma, updatedDistrict.id);

          for (const product of updateData.products) {
            await this.districtProductRepository.createWithTransaction(prisma, {
              districtId: updatedDistrict.id,
              productName: product,
            });
          }
        }

        return { message: "District updated successfully" };
      });

      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to update district");
    }
  }

  async getDistrictDetails(districtId: number): Promise<GetDistrictResponse> {
    try {
      const district = await this.districtRepository.findByIds(districtId);
      if (!district) {
        throw new NotFoundError("Distric");
      }

      const products = await this.districtProductRepository.findByDistrictId(districtId);
      const schools = await this.schoolRepository.findByDistrictIdWithStatus(districtId);

      const organizationContacts =
        (await this.organizationContactRepository.findByOrganizationId(districtId)) || [];

      const schoolContactsMap = new Map<number, OrganizationContact[]>();
      for (const school of schools) {
        if (school.id) {
          const schoolContacts =
            (await this.organizationContactRepository.findByOrganizationId(school.id)) || [];
          schoolContactsMap.set(school.id, schoolContacts);
        }
      }

      const billingContact = organizationContacts.find(
        (oc) => oc.rank === 1 && oc.contact?.contactType === ContactType.BILLING
      );
      const secondaryContact = organizationContacts.find(
        (oc) => oc.rank === 2 && oc.contact?.contactType === ContactType.DEFAULT
      );
      const primaryContact = organizationContacts.find(
        (oc) => oc.rank === 1 && oc.contact?.contactType === ContactType.DEFAULT
      );

      const districtDetails = {
        id: district.id!,
        cooperative_id: district.cooperativeId,
        name: district.name,
        location: district.location ?? null,
        director_name: district.directorName ?? null,
        address: {
          street_address_1: district.streetAddress1 ?? null,
          street_address_2: district.streetAddress2 ?? null,
          city: district.city ?? null,
          state: district.state ?? null,
          zip_code: district.zipCode ?? null,
        },
        phone: district.phone ?? null,
        email: district.email ?? null,
        fax: district.fax ?? null,
        website: district.website ?? null,
        district_enrollment: district.districtEnrollment ?? null,
        ra_number: district.raNumber ?? null,
        total_schools: district.numberOfSchools ?? null,
        total_students: district.numberOfStudents ?? null,
        annual_budget: district.annualBudget ? Number(district.annualBudget) : null,
        secondary_contact_name: secondaryContact?.contact
          ? `${secondaryContact.contact.firstName} ${secondaryContact.contact.lastName}`
          : null,
        secondary_contact_phone: secondaryContact?.contact?.phone ?? null,
        secondary_contact_email: secondaryContact?.contact?.email ?? null,
        superintendent_name: district.superintendentName ?? null,
        established_year: district.establishedYear ?? null,
        billing_contact_name: billingContact?.contact
          ? `${billingContact.contact.firstName} ${billingContact.contact.lastName}`
          : null,
        billing_address: {
          street_address_1: billingContact?.contact?.address1 ?? null,
          street_address_2: billingContact?.contact?.address2 ?? null,
          city: billingContact?.contact?.city ?? null,
          state: billingContact?.contact?.state ?? null,
          zip_code: billingContact?.contact?.zipcode ?? null,
        },
        billing_contact_phone: billingContact?.contact?.phone ?? null,
        billing_contact_email: billingContact?.contact?.email ?? null,
        shipping_address: district.shippingAddress ?? null,
        contact_first_name: primaryContact?.contact?.firstName ?? null,
        contact_last_name: primaryContact?.contact?.lastName ?? null,
        status: district.userStatus?.name ?? null,
        created_at: district.createdAt ?? null,
        is_deleted: district.isDeleted ?? null,
        products: (products || []).map((product) => product.productName),
        schools: (schools || []).map((school) => {
          const schoolContacts = school.id ? schoolContactsMap.get(school.id) || [] : [];
          const primaryContact = schoolContacts.find(
            (oc) => oc.rank === 1 && oc.contact?.contactType === ContactType.SCHOOL
          );

          return {
            id: school.id,
            name: school.name,
            enrollment: school.enrollment ?? 0,
            school_type: school.schoolType,
            shipping_address: school.shippingFullAddress || null,
            contact_first_name: primaryContact?.contact?.firstName ?? null,
            contact_last_name: primaryContact?.contact?.lastName ?? null,
            status: school.userStatuses?.name ?? null,
          };
        }),
      };

      return districtDetails as GetDistrictResponse;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to retrieve district details");
    }
  }

  async deactivateDistrict(districtId: number): Promise<DeactivateDistrictResponse> {
    try {
      const district = await this.districtRepository.findByIds(districtId);
      if (!district) {
        throw new NotFoundError("District");
      }

      district.markAsInactive();
      await this.districtRepository.update(district);

      return { message: "District deactivated successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to deactivate district");
    }
  }

  async activateDistrict(districtId: number): Promise<ActivateDistrictResponse> {
    try {
      const district = await this.districtRepository.findByIds(districtId);
      if (!district) {
        throw new NotFoundError("District");
      }

      district.markAsActive();
      await this.districtRepository.update(district);

      return { message: "District activated successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to activate district");
    }
  }

  async deleteDistrict(districtId: number): Promise<DeleteDistrictResponse> {
    try {
      const district = await this.districtRepository.findByIds(districtId);
      if (!district) {
        throw new NotFoundError("District");
      }

      district.markAsDeleted();
      await this.districtRepository.update(district);

      return { message: "District deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to delete district");
    }
  }

  private async generateNextDistrictCode(): Promise<string> {
    const lastDistrictCode = await this.districtRepository.findLastDistrictCode();

    if (!lastDistrictCode) {
      return "district-1";
    }

    const match = lastDistrictCode.match(/^district-(\d+)$/);
    if (!match) {
      return "district-1";
    }

    const lastNumber = parseInt(match[1], 10);
    const nextNumber = lastNumber + 1;
    console.log("nextNumber", nextNumber);
    return `district-${nextNumber}`;
  }

  async getLastDistrictCode(): Promise<string | null> {
    return await this.districtRepository.findLastDistrictCode();
  }
}
