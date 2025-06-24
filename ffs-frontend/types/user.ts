import { LoginResponseUser } from './auth';
import { mockDistricts, mockSchools } from './entities';

// User role types
export type RoleType =
  | 'Group Admin'
  | 'District Admin'
  | 'School Admin'
  | 'Viewer';
export type BidRoleType = 'Bid Administrator' | 'Bid Viewer' | 'None';
export type ScopeType = 'coop' | 'district' | 'school';

export type OrgScopeType = 'coop' | 'District' | 'school';
export type BidScopeType = 'district' | 'coop';

export type PlatformRole =
  | 'Group Admin'
  | 'District Admin'
  | 'School Admin'
  | 'Viewer';
export type BidRole = 'Bid Administrator' | 'Bid Viewer';

export interface RoleAssignment {
  type: PlatformRole;
  scope: {
    type: OrgScopeType;
    id: string;
    name?: string; // Optional name for display purposes
  };
  permissions: string[]; // e.g. ['edit_school', 'view_district']
}

export interface BidRoleAssignment {
  type: BidRole;
  scope: {
    type: BidScopeType;
    id: string;
    name?: string; // Optional name for display purposes
  };
  permissions: string[]; // e.g. ['view_bids']
}

// Role with scope
export interface Role {
  type: RoleType;
  scope: {
    type: ScopeType;
    id: string;
    name?: string; // Optional name for display purposes
  };
  permissions: string[]; // Specific permissions for this role
}

// Bid role with scope
export interface LegacyBidRole {
  type: BidRoleType;
  scope: {
    type: ScopeType;
    id: string;
    name?: string; // Optional name for display purposes
  };
  permissions: string[]; // Specific bid permissions for this role
}

// Bid manager assignment for specific bids
export interface BidManagerAssignment {
  bidId: string;
  bidName?: string; // Optional name for display purposes
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: RoleAssignment[];
  bidRoles: BidRoleAssignment[];
  managedBids: string[]; // List of bid IDs the user manages
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string | null; // ISO timestamp
  demoAccount: boolean;
  profilePicture?: string; // Added to match existing code
}

// Utility function to get a user's full name
export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// Mock users with the new interface structure
export const mockUsers: User[] = [
  // Group Admin
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'democoopadmin@foodforschools.com',
    roles: [
      {
        type: 'Group Admin',
        scope: {
          type: 'coop',
          id: 'coop-1',
        },
        permissions: [
          'manage_users',
          'manage_districts',
          'manage_schools',
          'view_all',
          'edit_all',
        ],
      },
    ],
    bidRoles: [
      {
        type: 'Bid Administrator',
        scope: {
          type: 'coop',
          id: 'coop-1',
        },
        permissions: [
          'create_bids',
          'edit_bids',
          'delete_bids',
          'award_bids',
          'manage_bid_users',
        ],
      },
    ],
    managedBids: ['BID-2023-001', 'BID-2023-005'],
    status: 'Active',
    lastLogin: '2023-05-15T10:30:00Z',
    demoAccount: true,
  },

  // District Admin
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Miller',
    email: 'demodistrictadmin@foodforschools.com',
    roles: [
      {
        type: 'District Admin',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: [
          'manage_users',
          'manage_schools',
          'edit_district',
          'view_district',
        ],
      },
    ],
    bidRoles: [
      {
        type: 'Bid Administrator',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: [
          'create_bids',
          'edit_bids',
          'delete_bids',
          'award_bids',
          'manage_bid_users',
        ],
      },
    ],
    managedBids: ['BID-2023-002'],
    status: 'Active',
    lastLogin: '2023-05-13T09:15:00Z',
    demoAccount: true,
  },

  // School Admin
  {
    id: '3',
    firstName: 'Taylor',
    lastName: 'Chen',
    email: 'demoschooladmin@foodforschools.com',
    roles: [
      {
        type: 'School Admin',
        scope: {
          type: 'school',
          id: 'school-101',
        },
        permissions: ['edit_school', 'view_school'],
      },
    ],
    bidRoles: [
      {
        type: 'Bid Viewer',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: ['view_bids'],
      },
    ],
    managedBids: ['BID-2023-003', 'BID-2023-004'],
    status: 'Active',
    lastLogin: '2023-05-12T11:20:00Z',
    demoAccount: true,
  },

  // Viewer
  {
    id: '4',
    firstName: 'Casey',
    lastName: 'Nguyen',
    email: 'demoreadonly@foodforschools.com',
    roles: [
      {
        type: 'Viewer',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: ['view_district'],
      },
    ],
    bidRoles: [
      {
        type: 'Bid Viewer',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: ['view_bids'],
      },
    ],
    managedBids: [],
    status: 'Active',
    lastLogin: '2023-05-11T15:30:00Z',
    demoAccount: true,
  },

  // Bid Administrator (not a District Admin)
  {
    id: '5',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'demobidadmin@foodforschools.com',
    roles: [
      {
        type: 'Viewer',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: ['view_district'],
      },
    ],
    bidRoles: [
      {
        type: 'Bid Administrator',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: [
          'create_bids',
          'edit_bids',
          'delete_bids',
          'award_bids',
          'manage_bid_users',
        ],
      },
    ],
    managedBids: ['BID-2023-001'],
    status: 'Active',
    lastLogin: '2023-05-10T13:45:00Z',
    demoAccount: true,
  },

  // Dual Role (Group Admin and District Admin)
  {
    id: '6',
    firstName: 'Alex',
    lastName: 'Ramirez',
    email: 'demodualadmin@foodforschools.com',
    roles: [
      {
        type: 'Group Admin',
        scope: {
          type: 'coop',
          id: 'coop-1',
        },
        permissions: [
          'manage_users',
          'manage_districts',
          'manage_schools',
          'view_all',
          'edit_all',
        ],
      },
      {
        type: 'District Admin',
        scope: {
          type: 'district',
          id: 'district-1',
        },
        permissions: [
          'manage_users',
          'manage_schools',
          'edit_district',
          'view_district',
        ],
      },
    ],
    bidRoles: [
      {
        type: 'Bid Administrator',
        scope: {
          type: 'coop',
          id: 'coop-1',
        },
        permissions: [
          'create_bids',
          'edit_bids',
          'delete_bids',
          'award_bids',
          'manage_bid_users',
        ],
      },
    ],
    managedBids: ['BID-2023-005'],
    status: 'Active',
    lastLogin: '2023-05-14T14:45:00Z',
    demoAccount: true,
  },

  // Vendor
  {
    id: '7',
    firstName: 'Vendor',
    lastName: 'Jones',
    email: 'demovendor@foodforschools.com',
    roles: [
      {
        type: 'Viewer',
        scope: {
          type: 'coop',
          id: 'coop-1',
        },
        permissions: ['view_bids'],
      },
    ],
    bidRoles: [],
    managedBids: [],
    status: 'Active',
    lastLogin: '2023-05-09T10:15:00Z',
    demoAccount: true,
  },
];

// Helper functions for role-based permissions
// Helper functions for working with users and roles

// Check if a user has a specific platform role
export function hasRole(
  user: LoginResponseUser,
  roleType: PlatformRole,
  scopeType?: OrgScopeType,
  scopeId?: number
): boolean {
  return user.roles.some((role) => {
    // Match role type
    if (role.type !== roleType) return false;

    // If scope type is specified, match it
    if (scopeType && role.scope.type !== scopeType) return false;

    // If scope id is specified, match it
    if (scopeId && role.scope.id !== scopeId) return false;

    return true;
  });
}

// Check if a user has a specific bid role
export function hasBidRole(
  user: LoginResponseUser,
  roleType: BidRole,
  scopeType?: BidScopeType,
  scopeId?: number
): boolean {
  return user.bidRoles.some((role) => {
    // Match role type
    if (role.type !== roleType) return false;

    // If scope type is specified, match it
    if (scopeType && role.scope.type !== scopeType) return false;

    // If scope id is specified, match it
    if (scopeId && role.scope.id !== scopeId) return false;

    return true;
  });
}

// Check if a user has a specific permission
export function hasPermission(user: User, permission: string): boolean {
  return user.roles.some((role) => role.permissions.includes(permission));
}

// Check if a user has a specific bid permission
export function hasBidPermission(
  user: LoginResponseUser,
  permission: string
): boolean {
  return user.bidRoles.some((role) =>
    role.permissions.some((perm) => perm.name == permission)
  );
}

// Check if a user manages a specific bid
export function isBidManager(user: User, bidId: string): boolean {
  return user.managedBids.includes(bidId);
}

// Get all entities of a specific type that a user has access to
export function getUserEntities(
  user: LoginResponseUser,
  scopeType: OrgScopeType
): { id: number }[] {
  const entities = new Map<number, { id: number }>();

  // Add entities from roles
  user.roles.forEach((role) => {
    if (role.scope.type === scopeType) {
      entities.set(role.scope.id, { id: role.scope.id });
    }
  });

  // Add entities from bid roles if applicable
  if ((scopeType === 'district' || scopeType === 'coop') && user.bidRoles) {
    user.bidRoles.forEach((role) => {
      if (role.scope.type === scopeType) {
        entities.set(role.scope.id, { id: role.scope.id });
      }
    });
  }

  return Array.from(entities.values());
}

// Check if a user can access user management
export function canAccessUserManagement(user: LoginResponseUser): boolean {
  return user.roles.some(
    (role) =>
      (role.type === 'Group Admin' || role.type === 'District Admin') &&
      role.permissions.some((permission) => permission.name == 'manage_users')
  );
}

// Check if a user belongs to a specific district
export function isUserInDistrict(user: User, districtId: string): boolean {
  // Direct district role
  if (
    user.roles.some(
      (role) => role.scope.type === 'district' && role.scope.id === districtId
    )
  ) {
    return true;
  }

  // School role in this district
  if (
    user.roles.some((role) => {
      if (role.scope.type === 'school') {
        const school = mockSchools.find((s) => s.id === role.scope.id);
        return school?.districtId === districtId;
      }
      return false;
    })
  ) {
    return true;
  }

  // Bid role for this district
  if (
    user.bidRoles.some(
      (role) => role.scope.type === 'district' && role.scope.id === districtId
    )
  ) {
    return true;
  }

  return false;
}

// Check if a user belongs to a specific co-op
export function isUserInCoop(user: User, coopId: string): boolean {
  // Check if user has a direct role in the coop
  if (
    user.roles.some(
      (role) => role.scope.type === 'coop' && role.scope.id === coopId
    )
  ) {
    return true;
  }

  // Check if user has a role in a district that's part of the coop
  const districtRoles = user.roles.filter(
    (role) => role.scope.type === 'district'
  );
  for (const role of districtRoles) {
    const district = mockDistricts.find((d) => d.id === role.scope.id);
    if (district && district.isInCoop && district.coopId === coopId) {
      return true;
    }
  }

  // Check if user has a role in a school that's part of a district in the coop
  const schoolRoles = user.roles.filter((role) => role.scope.type === 'school');
  for (const role of schoolRoles) {
    const school = mockSchools.find((s) => s.id === role.scope.id);
    if (school) {
      const district = mockDistricts.find((d) => d.id === school.districtId);
      if (district && district.isInCoop && district.coopId === coopId) {
        return true;
      }
    }
  }

  return false;
}

// Get users visible to a specific user based on their roles and organizational hierarchy
export function getVisibleUsers(currentUser: User, allUsers: User[]): User[] {
  // Always include the current user
  const result = new Set([currentUser]);

  // Group Admins can see all users in their co-ops and associated districts/schools
  const groupAdminRoles = currentUser.roles.filter(
    (role) =>
      role.type === 'Group Admin' && role.permissions.includes('manage_users')
  );

  if (groupAdminRoles.length > 0) {
    const adminCoopIds = groupAdminRoles.map((role) => role.scope.id);

    allUsers.forEach((user) => {
      if (user.id === currentUser.id) return; // Skip self (already included)

      // Check each co-op the current user administers
      for (const coopId of adminCoopIds) {
        // Check if user is directly associated with this co-op
        const directCoopAssociation =
          user.roles.some(
            (role) => role.scope.type === 'coop' && role.scope.id === coopId
          ) ||
          user.bidRoles.some(
            (role) => role.scope.type === 'coop' && role.scope.id === coopId
          );

        if (directCoopAssociation) {
          result.add(user);
          break;
        }

        // Get districts in this co-op
        const coopDistricts = mockDistricts.filter(
          (district) => district.coopId === coopId
        );
        const coopDistrictIds = coopDistricts.map((district) => district.id);

        // Check if user is associated with any district in this co-op
        const districtAssociation =
          user.roles.some(
            (role) =>
              role.scope.type === 'district' &&
              coopDistrictIds.includes(role.scope.id)
          ) ||
          user.bidRoles.some(
            (role) =>
              role.scope.type === 'district' &&
              coopDistrictIds.includes(role.scope.id)
          );

        if (districtAssociation) {
          result.add(user);
          break;
        }

        // Get all schools in districts in this co-op
        const coopSchoolIds = mockSchools
          .filter((school) => coopDistrictIds.includes(school.districtId))
          .map((school) => school.id);

        // Check if user is associated with any school in this co-op
        const schoolAssociation = user.roles.some(
          (role) =>
            role.scope.type === 'school' &&
            coopSchoolIds.includes(role.scope.id)
        );

        if (schoolAssociation) {
          result.add(user);
          break;
        }
      }
    });
  }

  // District Admins can see all users in their districts and associated schools
  const districtAdminRoles = currentUser.roles.filter(
    (role) =>
      role.type === 'District Admin' &&
      role.permissions.includes('manage_users')
  );

  if (districtAdminRoles.length > 0) {
    const adminDistrictIds = districtAdminRoles.map((role) => role.scope.id);

    allUsers.forEach((user) => {
      if (user.id === currentUser.id) return; // Skip self (already included)
      if (result.has(user)) return; // Skip if already added by co-op admin logic

      // Check each district the current user administers
      for (const districtId of adminDistrictIds) {
        // Check if user is directly associated with this district
        const directDistrictAssociation =
          user.roles.some(
            (role) =>
              role.scope.type === 'district' && role.scope.id === districtId
          ) ||
          user.bidRoles.some(
            (role) =>
              role.scope.type === 'district' && role.scope.id === districtId
          );

        if (directDistrictAssociation) {
          result.add(user);
          break;
        }

        // Get schools in this district
        const districtSchoolIds = mockSchools
          .filter((school) => school.districtId === districtId)
          .map((school) => school.id);

        // Check if user is associated with any school in this district
        const schoolAssociation = user.roles.some(
          (role) =>
            role.scope.type === 'school' &&
            districtSchoolIds.includes(role.scope.id)
        );

        if (schoolAssociation) {
          result.add(user);
          break;
        }
      }
    });
  }

  // School Admins can see users in their school
  const schoolAdminRoles = currentUser.roles.filter(
    (role) =>
      role.type === 'School Admin' && role.permissions.includes('manage_users')
  );

  if (schoolAdminRoles.length > 0) {
    const adminSchoolIds = schoolAdminRoles.map((role) => role.scope.id);

    allUsers.forEach((user) => {
      if (user.id === currentUser.id) return; // Skip self (already included)
      if (result.has(user)) return; // Skip if already added by higher-level admin logic

      // Check if user is associated with any of the schools the current user administers
      const schoolAssociation = user.roles.some(
        (role) =>
          role.scope.type === 'school' && adminSchoolIds.includes(role.scope.id)
      );

      if (schoolAssociation) {
        result.add(user);
      }
    });
  }

  return Array.from(result);
}

// Get a user by email
export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
}

// Get demo users
export function getDemoUsers(): User[] {
  return mockUsers.filter((user) => user.demoAccount === true);
}

export const canEditBid = (
  user: User | null | undefined,
  bid: any,
  userEntities: { id: string; type: ScopeType }[] = []
): boolean => {
  if (!user || !user.roles) return false;

  // Check if the user is a Group Admin or District Admin
  const isAdmin = user.roles.some(
    (role) => role.type === 'Group Admin' || role.type === 'District Admin'
  );
  if (isAdmin) return true;

  // Check if the user is a Bid Administrator for the bid's organization
  const isBidAdminForOrg =
    user.bidRoles &&
    user.bidRoles.some(
      (role) =>
        role.type === 'Bid Administrator' &&
        role.scope.type === bid.organizationType &&
        role.scope.id === bid.organizationId
    );
  if (isBidAdminForOrg) return true;

  // Check if the user is a Bid Manager for this specific bid
  if (user.managedBids && user.managedBids.includes(bid.id)) return true;

  return false;
};
