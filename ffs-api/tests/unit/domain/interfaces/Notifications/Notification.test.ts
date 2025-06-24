import { Notification } from '../../../../../src/domain/interfaces/Notifications/Notification';
import { Cooperative } from '../../../../../src/domain/interfaces/Cooperatives/Cooperative';
import { District } from '../../../../../src/domain/interfaces/Districts/District';

describe('Notification', () => {
  describe('constructor', () => {
    it('should create a notification with all properties', () => {
      const mockCooperative = new Cooperative({
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const notificationProps = {
        id: 1,
        title: 'Test Notification',
        details: 'This is a test notification',
        createdAt: new Date(),
        type: 'info',
        districtId: null,
        cooperativeId: 1,
        district: undefined,
        cooperative: mockCooperative
      };

      const notification = new Notification(notificationProps);

      expect(notification.id).toBe(1);
      expect(notification.title).toBe('Test Notification');
      expect(notification.details).toBe('This is a test notification');
      expect(notification.type).toBe('info');
      expect(notification.districtId).toBeNull();
      expect(notification.cooperativeId).toBe(1);
      expect(notification.cooperative).toBe(mockCooperative);
    });

    it('should create a notification with district', () => {
      const mockDistrict = {
        id: 1,
        name: 'Test District'
      } as District;

      const notificationProps = {
        id: 1,
        title: 'District Notification',
        details: 'This is a district notification',
        createdAt: new Date(),
        type: 'warning',
        districtId: 1,
        cooperativeId: null,
        district: mockDistrict,
        cooperative: undefined
      };

      const notification = new Notification(notificationProps);

      expect(notification.districtId).toBe(1);
      expect(notification.cooperativeId).toBeNull();
      expect(notification.district).toBe(mockDistrict);
      expect(notification.cooperative).toBeUndefined();
    });

    it('should create a notification without organization references', () => {
      const notificationProps = {
        id: 1,
        title: 'General Notification',
        details: 'This is a general notification',
        createdAt: new Date(),
        type: 'error',
        districtId: null,
        cooperativeId: null
      };

      const notification = new Notification(notificationProps);

      expect(notification.districtId).toBeNull();
      expect(notification.cooperativeId).toBeNull();
      expect(notification.district).toBeUndefined();
      expect(notification.cooperative).toBeUndefined();
    });
  });

  describe('getDisplayTitle', () => {
    it('should return the notification title', () => {
      const notification = new Notification({
        id: 1,
        title: 'Important Update',
        details: 'Please review the new policies',
        createdAt: new Date(),
        type: 'info'
      });

      expect(notification.getDisplayTitle()).toBe('Important Update');
    });

    it('should return empty string title', () => {
      const notification = new Notification({
        id: 1,
        title: '',
        details: 'No title notification',
        createdAt: new Date(),
        type: 'info'
      });

      expect(notification.getDisplayTitle()).toBe('');
    });

    it('should return title with special characters', () => {
      const notification = new Notification({
        id: 1,
        title: 'Alert: System Maintenance @ 2:00 PM!',
        details: 'System will be down for maintenance',
        createdAt: new Date(),
        type: 'warning'
      });

      expect(notification.getDisplayTitle()).toBe('Alert: System Maintenance @ 2:00 PM!');
    });
  });
});
