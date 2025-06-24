import bcrypt from 'bcrypt';
import { UserStatus } from '../../../../../src/domain/interfaces/userStatuses/UserStatus';
import { User } from '../../../../../src/domain/interfaces/users/User';
import { Bid } from '../../../../../src/domain/interfaces/Bids/Bid';
import { RoleCategoryEnum } from '../../../../../src/domain/constants/RoleCategoryEnum';

describe('User', () => {
  const baseUserProps = {
    id: 1,
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync('password', 10),
    firstName: 'John',
    lastName: 'Doe',
    userStatus: new UserStatus({ id: 1, name: 'Active' }),
    statusId: 1,
    lastLogin: new Date(),
    demoAccount: false,
    districtId: 1,
    isDeleted: false,
    emailVerified: true,
  };

  describe('constructor', () => {
    it('should create a user with default values', () => {
      const user = new User(baseUserProps);

      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.userStatus).toBeInstanceOf(UserStatus);
      expect(user.demoAccount).toBe(false);
      expect(user.isDeleted).toBe(false);
      expect(user.emailVerified).toBe(true);
      expect(user.userRoles).toEqual([]);
      expect(user.managedBids).toEqual([]);
    });

    it('should initialize with provided roles and bids', () => {
      const mockRole = { id: 1, userId: 1, roleId: 1, scopeId: 1 };
      const mockBid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process'
      });

      const user = new User({
        ...baseUserProps,
        userRoles: [mockRole],
        managedBids: [{ userId: 1, bidId: mockBid.id!, bid: mockBid }],
      });

      expect(user.userRoles.length).toBe(1);
      expect(user.managedBids.length).toBe(1);
    });
  });

  describe('methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(baseUserProps);
    });

    describe('fullName', () => {
      it('should return the full name', () => {
        expect(user.fullName).toBe('John Doe');
      });
    });

    describe('isActive', () => {
      it('should return true when user status is active', () => {
        expect(user.isActive()).toBe(true);
      });

      it('should return false when user status is not active', () => {
        const inactiveUser = new User({
          ...baseUserProps,
          userStatus: new UserStatus({ id: 2, name: 'Inactive' }),
        });
        expect(inactiveUser.isActive()).toBe(false);
      });
    });

    describe('isEmailVerified', () => {
      it('should return true when email is verified', () => {
        expect(user.isEmailVerified()).toBe(true);
      });

      it('should return false when email is not verified', () => {
        const unverifiedUser = new User({
          ...baseUserProps,
          emailVerified: false,
        });
        expect(unverifiedUser.isEmailVerified()).toBe(false);
      });
    });

    describe('checkPassword', () => {
      it('should return true for correct password', async () => {
        const result = await user.checkPassword('password');
        expect(result).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const result = await user.checkPassword('wrongpassword');
        expect(result).toBe(false);
      });
    });

    describe('getAdminRoles', () => {
      it('should return admin roles', () => {
        const adminRole = {
          id: 1,
          userId: 1,
          roleId: 1,
          scopeId: 1,
          role: {
            roleCategory: { name: RoleCategoryEnum.ADMIN } // Changed from 'admin' to 'Admin' to match mock data
          }
        };
        const bidRole = {
          id: 2,
          userId: 1,
          roleId: 2,
          scopeId: 1,
          role: {
            roleCategory: { name: RoleCategoryEnum.BID } // Changed from 'bid' to 'Bid' to match mock data
          }
        };

        const userWithRoles = new User({
          ...baseUserProps,
          userRoles: [adminRole, bidRole],
        });

        const adminRoles = userWithRoles.getAdminRoles();
        expect(adminRoles.length).toBe(1);
        expect(adminRoles[0].id).toBe(1);
      });
    });

    describe('getBidRoles', () => {
      it('should return bid roles', () => {
        const adminRole = {
          id: 1,
          userId: 1,
          roleId: 1,
          scopeId: 1,
          role: {
            roleCategory: { name: RoleCategoryEnum.ADMIN } // Changed from 'admin' to 'Admin'
          }
        };
        const bidRole = {
          id: 2,
          userId: 1,
          roleId: 2,
          scopeId: 1,
          role: {
            roleCategory: { name: RoleCategoryEnum.BID } // Changed from 'bid' to 'Bid'
          }
        };

        const userWithRoles = new User({
          ...baseUserProps,
          userRoles: [adminRole, bidRole],
        });

        const bidRoles = userWithRoles.getBidRoles();
        expect(bidRoles.length).toBe(1);
        expect(bidRoles[0].id).toBe(2);
      });
    });
  });
});
