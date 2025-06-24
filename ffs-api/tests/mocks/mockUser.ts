import { Bid } from "../../src/domain/interfaces/Bids/Bid";
import { RoleCategory } from "../../src/domain/interfaces/roleCategories/RoleCategory";
import { Role } from "../../src/domain/interfaces/roles/Role";
import { Scope } from "../../src/domain/interfaces/scopes/Scope";
import { ScopeType } from "../../src/domain/interfaces/scopeTypes/ScopeType";
import { UserRole } from "../../src/domain/interfaces/userRoles/UserRole";
import { User } from "../../src/domain/interfaces/users/User";
import { UserStatus } from "../../src/domain/interfaces/userStatuses/UserStatus";
import { RoleCategoryEnum } from "../../src/domain/constants/RoleCategoryEnum";

// Mock UserStatus
export const mockActiveStatus: UserStatus = {
  id: 1,
  name: 'Active',
} as UserStatus;

export const mockInactiveStatus: UserStatus = {
  id: 2,
  name: 'Inactive',
} as UserStatus;

// Mock ScopeType
export const mockGlobalScopeType: ScopeType = {
  id: 1,
  name: 'Global',
};

export const mockOrgScopeType: ScopeType = {
  id: 2,
  name: 'Organization',
};

// Mock Scope
export const mockGlobalScope: Scope = {
  id: 101,
  typeId: mockGlobalScopeType.id,
  name: null,
  scopeType: mockGlobalScopeType,
};

export const mockOrgScope: Scope = {
  id: 102,
  typeId: mockOrgScopeType.id,
  name: 'Acme Corp',
  scopeType: mockOrgScopeType,
};

// Mock RoleCategory
export const mockAdminCategory: RoleCategory = {
  id: 201,
  name: RoleCategoryEnum.ADMIN,
};

export const mockBidCategory: RoleCategory = {
  id: 202,
  name: RoleCategoryEnum.BID,
};

// Mock Role
export const mockAdminRole: Role = {
  id: 301,
  name: 'Super Admin',
  categoryId: mockAdminCategory.id,
  roleCategory: mockAdminCategory,
};

export const mockBidManagerRole: Role = {
  id: 302,
  name: 'Bid Manager',
  categoryId: mockBidCategory.id,
  roleCategory: mockBidCategory,
};

// Mock UserRole
export const mockAdminUserRole: UserRole = {
  id: 401,
  userId: 1,
  roleId: mockAdminRole.id,
  scopeId: mockGlobalScope.id,
  role: mockAdminRole,
  scope: mockGlobalScope,
};

export const mockBidManagerUserRole: UserRole = {
  id: 402,
  userId: 1,
  roleId: mockBidManagerRole.id,
  scopeId: mockOrgScope.id,
  role: mockBidManagerRole,
  scope: mockOrgScope,
};

// Mock Bid
export const mockBid1: Bid = new Bid({
  id: 501,
  code: 'BID-2025-001',
  name: 'Mock Bid 1',
  bidYear: '2025',
  status: 'In Process'
});

export const mockBid2: Bid = new Bid({
  id: 502,
  code: 'BID-2025-002',
  name: 'Mock Bid 2',
  bidYear: '2025',
  status: 'Released'
});

// Mock User
export const mockUser = new User({
  id: 1,
  email: 'test.user@example.com',
  passwordHash: 'hasehd-pass',
  firstName: 'Test',
  lastName: 'User',
  userStatus: mockActiveStatus,
  lastLogin: new Date('2025-05-07T10:00:00Z'),
  demoAccount: false,
  statusId: 1,
  districtId: 10,
  isDeleted: false,
  emailVerified: true,
  userRoles: [mockAdminUserRole, mockBidManagerUserRole],
  managedBids: [{ userId: 1, bidId: mockBid1.id!, bid: mockBid1 }],
});

// You can create more mock users with different properties as needed
export const fakeUser = new User({
  id: 2,
  email: 'demo.user@example.com',
  passwordHash: 'hasehd-pass',
  firstName: 'Demo',
  lastName: 'User',
  userStatus: mockActiveStatus,
  demoAccount: true,
  statusId: 1,
  districtId: 10,
  isDeleted: false,
  emailVerified: false,
  userRoles: [],
  managedBids: [{ userId: 2, bidId: mockBid2.id!, bid: mockBid2 }],
});

export const mockInactiveUser = new User({
  id: 3,
  email: 'inactive.user@example.com',
  passwordHash: 'hasehd-pass',
  firstName: 'Inactive',
  lastName: 'User',
  userStatus: mockInactiveStatus,
  demoAccount: true,
  statusId: 2,
  districtId: 15,
  isDeleted: false,
  emailVerified: true,
  userRoles: [],
  lastLogin: new Date('2025-04-01T12:00:00Z'),
});
