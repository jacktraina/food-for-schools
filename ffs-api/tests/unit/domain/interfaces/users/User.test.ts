import { User } from '../../../../../src/domain/interfaces/users/User';
import { UserStatus } from '../../../../../src/domain/interfaces/userStatuses/UserStatus';
import { UserRole } from '../../../../../src/domain/interfaces/userRoles/UserRole';
import { Role } from '../../../../../src/domain/interfaces/roles/Role';
import { RoleCategory } from '../../../../../src/domain/interfaces/roleCategories/RoleCategory';
import { RoleCategoryEnum } from '../../../../../src/domain/constants/RoleCategoryEnum';

describe('User', () => {
  const mockUserStatus = new UserStatus({
    id: 1,
    name: 'Active'
  });

  const mockRoleCategory = new RoleCategory({
    id: 1,
    name: RoleCategoryEnum.ADMIN
  });

  const mockRole = new Role({
    id: 1,
    name: 'Admin Role',
    categoryId: 1,
    roleCategory: mockRoleCategory
  });

  const mockUserRole = new UserRole({
    id: 1,
    userId: 1,
    roleId: 1,
    scopeId: 1,
    role: mockRole
  });

  describe('constructor', () => {
    it('should create User with all properties', () => {
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: true,
        demoAccount: false
      });

      expect(user.id).toBe(1);
      expect(user.email).toBe('user@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.statusId).toBe(1);
      expect(user.isDeleted).toBe(false);
      expect(user.emailVerified).toBe(true);
    });

    it('should use default values when optional properties are not provided', () => {
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false
      });

      expect(user.lastLogin).toBeNull();
      expect(user.demoAccount).toBe(false);
      expect(user.cooperativeId).toBeNull();
      expect(user.districtId).toBeNull();
      expect(user.isDeleted).toBe(false);
      expect(user.emailVerified).toBe(false);
      expect(user.cooperative).toBeNull();
      expect(user.district).toBeNull();
      expect(user.userRoles).toEqual([]);
    });
  });

  describe('fullName getter', () => {
    it('should return full name', () => {
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false
      });

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('isActive', () => {
    it('should return true when user status id is 1', () => {
      const activeUserStatus = new UserStatus({ id: 1, name: 'Active' });
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: activeUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false
      });

      expect(user.isActive()).toBe(true);
    });

    it('should return false when user status id is not 1', () => {
      const inactiveUserStatus = new UserStatus({ id: 2, name: 'Inactive' });
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 2,
        userStatus: inactiveUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false
      });

      expect(user.isActive()).toBe(false);
    });
  });

  describe('isEmailVerified', () => {
    it('should return true when email is verified', () => {
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: true,
        demoAccount: false
      });

      expect(user.isEmailVerified()).toBe(true);
    });

    it('should return false when email is not verified', () => {
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false
      });

      expect(user.isEmailVerified()).toBe(false);
    });
  });

  describe('markEmailAsVerified', () => {
    it('should set emailVerified to true', () => {
      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false
      });

      expect(user.emailVerified).toBe(false);
      user.markEmailAsVerified();
      expect(user.emailVerified).toBe(true);
    });
  });

  describe('getAdminRoles', () => {
    it('should return admin roles when user has admin roles', () => {
      const adminRoleCategory = new RoleCategory({
        id: 1,
        name: RoleCategoryEnum.ADMIN
      });

      const adminRole = new Role({
        id: 1,
        name: 'Admin Role',
        categoryId: 1,
        roleCategory: adminRoleCategory
      });

      const adminUserRole = new UserRole({
        id: 1,
        userId: 1,
        roleId: 1,
        scopeId: 1,
        role: adminRole
      });

      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false,
        userRoles: [adminUserRole]
      });

      const adminRoles = user.getAdminRoles();
      expect(adminRoles).toHaveLength(1);
      expect(adminRoles[0]).toBe(adminUserRole);
    });

    it('should return empty array when user has no admin roles', () => {
      const bidRoleCategory = new RoleCategory({
        id: 2,
        name: RoleCategoryEnum.BID
      });

      const bidRole = new Role({
        id: 2,
        name: 'Bid Role',
        categoryId: 2,
        roleCategory: bidRoleCategory
      });

      const bidUserRole = new UserRole({
        id: 2,
        userId: 1,
        roleId: 2,
        scopeId: 1,
        role: bidRole
      });

      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false,
        userRoles: [bidUserRole]
      });

      const adminRoles = user.getAdminRoles();
      expect(adminRoles).toHaveLength(0);
    });
  });

  describe('getBidRoles', () => {
    it('should return bid roles when user has bid roles', () => {
      const bidRoleCategory = new RoleCategory({
        id: 2,
        name: RoleCategoryEnum.BID
      });

      const bidRole = new Role({
        id: 2,
        name: 'Bid Role',
        categoryId: 2,
        roleCategory: bidRoleCategory
      });

      const bidUserRole = new UserRole({
        id: 2,
        userId: 1,
        roleId: 2,
        scopeId: 1,
        role: bidRole
      });

      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false,
        userRoles: [bidUserRole]
      });

      const bidRoles = user.getBidRoles();
      expect(bidRoles).toHaveLength(1);
      expect(bidRoles[0]).toBe(bidUserRole);
    });

    it('should return empty array when user has no bid roles', () => {
      const adminRoleCategory = new RoleCategory({
        id: 1,
        name: RoleCategoryEnum.ADMIN
      });

      const adminRole = new Role({
        id: 1,
        name: 'Admin Role',
        categoryId: 1,
        roleCategory: adminRoleCategory
      });

      const adminUserRole = new UserRole({
        id: 1,
        userId: 1,
        roleId: 1,
        scopeId: 1,
        role: adminRole
      });

      const user = new User({
        id: 1,
        email: 'user@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        statusId: 1,
        userStatus: mockUserStatus,
        isDeleted: false,
        emailVerified: false,
        demoAccount: false,
        userRoles: [adminUserRole]
      });

      const bidRoles = user.getBidRoles();
      expect(bidRoles).toHaveLength(0);
    });
  });
});
