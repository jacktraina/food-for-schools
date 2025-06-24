import { District } from '../../domain/interfaces/Districts/District';
import { CreateDistrictRequest } from '../../interfaces/requests/district/CreateDistrictRequest';
import { UpdateDistrictRequestData } from '../../interfaces/requests/district/UpdateDistrictRequest';
import { DeactivateDistrictResponse } from '../../interfaces/responses/district/DeactivateDistrictResponse';
import { ActivateDistrictResponse } from '../../interfaces/responses/district/ActivateDistrictResponse';
import { GetDistrictListResponse } from '../../interfaces/responses/district/GetDistrictListResponse';
import { UpdateDistrictResponse } from '../../interfaces/responses/district/UpdateDistrictResponse';
import { GetDistrictResponse } from '../../interfaces/responses/district/GetDistrictDetailsResponse';
import { DeleteDistrictResponse } from '../../interfaces/responses/district/DeleteDistrictResponse';

export interface IDistrictService {
  createDistrict(
    districtData: CreateDistrictRequest,
    statusId: number,
    organizationId: number
  ): Promise<District>;
  getDistrictLists(cooperativeId: number): Promise<GetDistrictListResponse[]>;
  updateDistrict(
    districtId: number,
    updateData: UpdateDistrictRequestData
  ): Promise<UpdateDistrictResponse>;
  getDistrictDetails(
    districtId: number
  ): Promise<GetDistrictResponse>;
  deactivateDistrict(
    districtId: number
  ): Promise<DeactivateDistrictResponse>;
  activateDistrict(
    districtId: number
  ): Promise<ActivateDistrictResponse>;
  deleteDistrict(
    districtId: number
  ): Promise<DeleteDistrictResponse>;
}
