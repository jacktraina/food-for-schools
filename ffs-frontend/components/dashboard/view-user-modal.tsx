'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pause, Play } from 'lucide-react';
import { mockDistricts, mockSchools } from '@/types/entities';
import { LoginResponseUser, User } from '@/types/auth';

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onToggleActivation: () => void;
  onDelete: () => void;
  onSave: (userId: number, updatedData: Partial<User>) => void;
  currentUser: LoginResponseUser | null;
  isEditMode?: boolean;
}

export function ViewUserModal({
  isOpen,
  onClose,
  user,
  onToggleActivation,
  onDelete,
  onSave,
  currentUser,
  isEditMode = false,
}: ViewUserModalProps) {
  const [activeTab, setActiveTab] = useState('user-info');

  // Form state
  const [formData, setFormData] = useState({
    role: '',
    bidRole: '',
    districtId: '',
    schoolId: '',
    managedBids: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        role: getPrimaryRole(user),
        bidRole: getPrimaryBidRole(user),
        districtId:
          user.roles.find((r) => r.scope.type === 'district')?.scope.id || '',
        schoolId:
          user.roles.find((r) => r.scope.type === 'school')?.scope.id || '',
        managedBids: user.managedBids || [],
      });
    }
  }, [user]);

  if (!user) return null;

  // Get primary role for display
  const getPrimaryRole = (user: User): string => {
    if (user.roles.some((role) => role.type === 'Group Admin'))
      return 'Group Admin';
    if (user.roles.some((role) => role.type === 'District Admin'))
      return 'District Admin';
    if (user.roles.some((role) => role.type === 'School Admin'))
      return 'School Admin';
    if (user.roles.some((role) => role.type === 'Viewer')) return 'Viewer';
    return 'User';
  };

  // Get primary bid role for display
  const getPrimaryBidRole = (user: User): string => {
    if (user.bidRoles.some((role) => role.type === 'Bid Administrator'))
      return 'Bid Administrator';
    if (user.bidRoles.some((role) => role.type === 'Bid Viewer'))
      return 'Bid Viewer';
    return 'None';
  };

  // Get district names for display
  const getDistrictNames = (user: User): string => {
    const districtRoles = user.roles.filter(
      (role) => role.scope.type === 'district'
    );
    if (districtRoles.length > 0) {
      return districtRoles
        .map((role) => {
          if (role.scope.name) return role.scope.name;
          const district = mockDistricts.find(
            (d) => d.id.toString() === role.scope.id
          );
          return district ? district.name : role.scope.id;
        })
        .join(', ');
    }
    return '';
  };

  // Get school names for display
  const getSchoolNames = (user: User): string => {
    const schoolRoles = user.roles.filter(
      (role) => role.scope.type === 'school'
    );
    if (schoolRoles.length > 0) {
      return schoolRoles
        .map((role) => {
          if (role.scope.name) return role.scope.name;
          const school = mockSchools.find((s) => s.id === role.scope.id);
          return school ? school.name : role.scope.id;
        })
        .join(', ');
    }
    return '';
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Check if current user can edit this user
  const canEdit = () => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return false; // Can't edit yourself

    // Group Admins can edit most users
    if (currentUser.roles.some((role) => role.type === 'Group Admin')) {
      // But they can't edit other Group Admins
      if (user.roles.some((role) => role.type === 'Group Admin')) {
        return false;
      }
      return true;
    }

    // District Admins can edit users in their district
    if (currentUser.roles.some((role) => role.type === 'District Admin')) {
      const currentUserDistrictIds = currentUser.roles
        .filter((role) => role.scope.type === 'district')
        .map((role) => role.scope.id);

      // Check if user has a direct district role in any of current user's districts
      const hasDistrictRole = user.roles.some(
        (role) =>
          role.scope.type === 'district' &&
          currentUserDistrictIds.includes(Number(role.scope.id))
      );

      if (hasDistrictRole) return true;

      // Check if user has a school role where the school belongs to any of current user's districts
      const hasSchoolInDistrict = user.roles.some((role) => {
        if (role.scope.type === 'school') {
          const schoolId = role.scope.id;
          const school = mockSchools.find((s) => s.id === schoolId);
          return (
            school && currentUserDistrictIds.includes(Number(school.districtId))
          );
        }
        return false;
      });

      if (hasSchoolInDistrict) return true;
    }

    return false;
  };

  // Check if current user can delete this user
  const canDelete = () => {
    // Same logic as edit for now, but could be more restrictive
    return canEdit();
  };

  const handleSave = () => {
    if (!user) return;

    // Prepare updated user data
    const updatedData: Partial<User> = {
      roles: [...user.roles],
      bidRoles: [...user.bidRoles],
      managedBids: formData.managedBids,
    };

    // Update roles based on form data
    // if (formData.role !== getPrimaryRole(user)) {
    //   // Replace the primary role
    //   const primaryRoleIndex = updatedData.roles.findIndex(
    //     (r) =>
    //       r.type === 'Group Admin' ||
    //       r.type === 'District Admin' ||
    //       r.type === 'School Admin' ||
    //       r.type === 'Viewer'
    //   );

    //   if (primaryRoleIndex >= 0) {
    //     updatedData.roles[primaryRoleIndex] = {
    //       ...updatedData.roles[primaryRoleIndex],
    //       type: formData.role,
    //     };
    //   } else {
    //     // Add new role if none exists
    //     updatedData.roles.push({
    //       type: formData.role,
    //       scope: {
    //         type: 'district',
    //         id: formData.districtId || 'district1',
    //         name:
    //           mockDistricts.find((d) => d.id === formData.districtId)?.name ||
    //           'Default District',
    //       },
    //       permissions: [],
    //     });
    //   }
    // }

    // Update bid roles based on form data
    // if (formData.bidRole !== getPrimaryBidRole(user)) {
    //   // Replace the primary bid role
    //   const primaryBidRoleIndex = updatedData.bidRoles.findIndex(
    //     (r) => r.type === 'Bid Administrator' || r.type === 'Bid Viewer'
    //   );

    //   if (primaryBidRoleIndex >= 0) {
    //     updatedData.bidRoles[primaryBidRoleIndex] = {
    //       ...updatedData.bidRoles[primaryBidRoleIndex],
    //       type: formData.bidRole,
    //     };
    //   } else {
    //     // Add new bid role if none exists
    //     updatedData.bidRoles.push({
    //       type: formData.bidRole,
    //       scope: {
    //         type: 'district',
    //         id: formData.districtId || 'district1',
    //         name:
    //           mockDistricts.find((d) => d.id === formData.districtId)?.name ||
    //           'Default District',
    //       },
    //       permissions: [],
    //     });
    //   }
    // }

    onSave(user.id, updatedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? 'Edit User' : 'User Details'}
            {user.status === 'Active' && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                Active
              </Badge>
            )}
            {user.status === 'Inactive' && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Inactive
              </Badge>
            )}
            {user.status === 'Pending' && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                Pending
              </Badge>
            )}
            {currentUser?.id === user.id && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                You
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Edit user information and permissions.'
              : 'View and manage user information.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="user-info">User Information</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="user-info" className="space-y-4 mt-0">
            <div className="grid gap-4 py-2">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user.firstName}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user.lastName}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              {/* Status and Last Login */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={user.status}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastLogin">Last Login</Label>
                  <Input
                    id="lastLogin"
                    value={formatDate(user.lastLogin)}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>

              {/* District and School */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="district">District</Label>
                  {isEditMode ? (
                    <Select
                      value={formData.districtId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, districtId: value })
                      }
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDistricts.map((district) => (
                          <SelectItem
                            key={district.id}
                            value={district.id.toString()}
                          >
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="district"
                      value={getDistrictNames(user) || 'None'}
                      readOnly
                      className="bg-gray-100"
                    />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="school">School</Label>
                  {isEditMode ? (
                    <Select
                      value={formData.schoolId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, schoolId: value })
                      }
                    >
                      <SelectTrigger id="school">
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSchools
                          .filter(
                            (school) =>
                              !formData.districtId ||
                              school.districtId === formData.districtId
                          )
                          .map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="school"
                      value={getSchoolNames(user) || 'None'}
                      readOnly
                      className="bg-gray-100"
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="grid gap-4 py-2">
              {/* Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                {isEditMode ? (
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Group Admin">Group Admin</SelectItem>
                      <SelectItem value="District Admin">
                        District Admin
                      </SelectItem>
                      <SelectItem value="School Admin">School Admin</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="role"
                    value={getPrimaryRole(user)}
                    readOnly
                    className="bg-gray-100"
                  />
                )}
              </div>

              {/* Bid Role */}
              <div className="grid gap-2">
                <Label htmlFor="bidRole">Bid Role</Label>
                {isEditMode ? (
                  <Select
                    value={formData.bidRole}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bidRole: value })
                    }
                  >
                    <SelectTrigger id="bidRole">
                      <SelectValue placeholder="Select bid role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bid Administrator">
                        Bid Administrator
                      </SelectItem>
                      <SelectItem value="Bid Viewer">Bid Viewer</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="bidRole"
                    value={getPrimaryBidRole(user)}
                    readOnly
                    className="bg-gray-100"
                  />
                )}
              </div>

              {/* Managed Bids */}
              <div className="grid gap-2">
                <Label htmlFor="managedBids">Managed Bids</Label>
                <Input
                  id="managedBids"
                  value={
                    user.managedBids.length > 0
                      ? user.managedBids.join(', ')
                      : 'None'
                  }
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              {/* Detailed Permissions could be added here */}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:gap-0">
          <div className="flex gap-2 order-2 sm:order-1">
            {canDelete() && (
              <Button variant="destructive" onClick={() => onDelete()}>
                Delete User
              </Button>
            )}
            {user.status === 'Active' && canEdit() && (
              <Button
                variant="outline"
                onClick={() => onToggleActivation()}
                className="flex items-center gap-1"
              >
                <Pause className="h-4 w-4" />
                Deactivate
              </Button>
            )}
            {user.status === 'Inactive' && canEdit() && (
              <Button
                variant="outline"
                onClick={() => onToggleActivation()}
                className="flex items-center gap-1"
              >
                <Play className="h-4 w-4" />
                Activate
              </Button>
            )}
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {isEditMode ? (
              <Button onClick={handleSave}>Save Changes</Button>
            ) : (
              canEdit() && (
                <Button onClick={() => onSave(user.id, {})}>Edit</Button>
              )
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
