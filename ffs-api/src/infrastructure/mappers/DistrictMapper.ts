import { Prisma } from "@prisma/client";
import { District } from "../../domain/interfaces/Districts/District";
import { Decimal } from '@prisma/client/runtime/library';

export class DistrictMapper {
  static toPrismaUpdate(entity: District): Prisma.DistrictUpdateInput {
    return {
      name: entity.name,
      location: entity.location,
      directorName: entity.directorName,
      streetAddress1: entity.streetAddress1,
      streetAddress2: entity.streetAddress2,
      city: entity.city,
      state: entity.state,
      zipCode: entity.zipCode,
      phone: entity.phone,
      email: entity.email,
      fax: entity.fax,
      website: entity.website,
      districtEnrollment: entity.districtEnrollment,
      raNumber: entity.raNumber,
      numberOfSchools: entity.numberOfSchools,
      numberOfStudents: entity.numberOfStudents,
      annualBudget: entity.annualBudget ? new Decimal(entity.annualBudget) : null,
      superintendentName: entity.superintendentName,
      establishedYear: entity.establishedYear,
      code: entity.code,
      participatingIn: entity.participatingIn,
      shippingAddress: entity.shippingAddress,
      description: entity.description,
      notes: entity.notes,
      isDeleted: entity.isDeleted,
      updatedAt: entity.updatedAt,
      userStatus: {
        connect: {
          id: entity.statusId
        }
      }
    };
  }
}
