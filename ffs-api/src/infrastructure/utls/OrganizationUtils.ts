import { StatusEnum } from "../../domain/constants/StatusEnum";
import { VendorStatusesEnum } from "../../domain/constants/VendorStatusesEnum";

export class OrganizationUtils {
  public static BuildOrganizationWhereClause(params: {
    cooperativeId?: number;
    districtId?: number;
    statusId?: StatusEnum | VendorStatusesEnum;
    isDeleted?: boolean;
    dateField?: "registeredAt" | "createdAt";
    date?: Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): any {
    const { cooperativeId, districtId, statusId, isDeleted, dateField, date } =
      params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (statusId !== undefined) {
      where.statusId = statusId;
    }

    if (isDeleted !== undefined) {
      where.isDeleted = isDeleted;
    }

    if (dateField && date) {
      where[dateField] = { gte: date };
    }

    // Handle cooperative/district filters
    if (cooperativeId && districtId) {
      where.OR = [{ cooperativeId }, { districtId }];
    } else {
      if (cooperativeId) {
        where.cooperativeId = cooperativeId;
      }
      if (districtId) {
        where.districtId = districtId;
      }
    }

    return where;
  }
}
