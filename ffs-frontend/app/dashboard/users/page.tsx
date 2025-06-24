'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Edit,
  Search,
  UserPlus,
  X,
  Upload,
  Eye,
  Pause,
  Play,
  ArrowLeft,
  ArrowRight,
  Download,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddUserModal } from '@/components/dashboard/add-user-modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Meta, User } from '@/types/auth';
import { hasRole, getUserEntities, getFullName } from '@/types/user';
import { mockDistricts, mockSchools } from '@/types/entities';
import { BulkUploadUsersModal } from '@/components/dashboard/bulk-upload-users-modal';
import { ViewUserModal } from '@/components/dashboard/view-user-modal';
import {
  UserFiltersModal,
  type UserFilters,
} from '@/components/dashboard/user-filters-modal';
import { LoginResponseUser } from '@/types/auth';
import {
  useApiQuery,
  useDeleteMutation,
  usePutMutation,
} from '@/hooks/use-api';
import useDebounce from '@/hooks/useDebounce';
import { AxiosError } from 'axios';
import { UpdateUserRequestData } from '@/schemas/userSchema';
import { buildUserQueryParams } from '@/lib/utils';

export default function UserManagementPage() {
  const router = useRouter();
  //   const [users, setUsers] = useState<LoginResponseUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    bidRole: 'all',
    status: 'all',
    district: 'all',
  });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<
    'delete' | 'activate' | 'deactivate' | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<LoginResponseUser | null>(
    null
  );
  const { toast } = useToast();
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  //   const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //Debounce Search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load current user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as LoginResponseUser;
        setCurrentUser(parsedUser);

        // Check if user can access this page
        if (
          !hasRole(parsedUser, 'Group Admin') &&
          !hasRole(parsedUser, 'District Admin')
        ) {
          // Redirect to dashboard if user doesn't have permission
          router.push('/dashboard');
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
        router.push('/dashboard');
      }
    } else {
      // For demo purposes, let's use a default admin user
      const defaultAdmin: LoginResponseUser = {
        id: 7,
        name: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        email: 'democoopadmin@foodforschools.com',
        roles: [
          {
            type: 'Group Admin',
            scope: {
              type: 'coop',
              id: 1,
            },
            permissions: [
              { name: 'manage_users' },
              { name: 'manage_districts' },
              { name: 'manage_schools' },
              { name: 'view_all' },
              { name: 'edit_all' },
            ],
          },
        ],
        bidRoles: [],
        manageBids: [],
        status: 'Active',
        lastLogin: new Date(),
        demoAccount: true,
      };

      setCurrentUser(defaultAdmin);
      localStorage.setItem('user', JSON.stringify(defaultAdmin));
    }
  }, [router]);

  const queryString = buildUserQueryParams({
    search: debouncedSearch,
    filters,
  });

  const {
    data: users,
    isLoading,
    refetch,
  } = useApiQuery<User[]>(`/users/search?${queryString}`, [
    'users',
    queryString,
  ]);

  const { mutate: updateUser, isPending: isUpdateUserPending } = usePutMutation<
    UpdateUserRequestData,
    Meta
  >('/users', {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User has been updated successfully.',
        variant: 'success',
      });
      setIsViewUserModalOpen(false);
      setIsEditMode(false);
      refetch();
    },
    onError: (error: AxiosError<Meta>) => {
      toast({
        title: 'Error',
        description: `${
          error?.response?.data?.error || 'Failed to update user'
        }`,
        variant: 'destructive',
      });
    },
  });

  const { mutate: deleteUser, isPending: isDeleteUserPending } =
    useDeleteMutation<Meta>('/users', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User has been deleted successfully.',
          variant: 'success',
        });
        setIsConfirmationModalOpen(false);
        setConfirmationAction(null);
        setSelectedUser(null);
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.message || 'Failed to delete user'
          }`,
          variant: 'destructive',
        });
      },
    });

  const { mutate: deactivateUser, isPending: isPendingUserDeactivation } =
    usePutMutation<{}, Meta>(`/users`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User has been deactivated successfully.',
          variant: 'success',
        });
        setIsConfirmationModalOpen(false);
        setConfirmationAction(null);
        setSelectedUser(null);
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.message || 'Failed to deactivate user'
          }`,
          variant: 'destructive',
        });
      },
    });

  const { mutate: activateUser, isPending: isPendingUserActivation } =
    usePutMutation<{}, Meta>(`/users`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'User has been activated successfully.',
          variant: 'success',
        });
        refetch();
        setIsConfirmationModalOpen(false);
        setConfirmationAction(null);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.message || 'Failed to activate user'
          }`,
          variant: 'destructive',
        });
      },
    });

  // Calculate pagination
  const totalItems = users?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = users?.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // Handle adding a new user
  const handleAddUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    bidRole: string;
    districtId?: string;
    schoolId?: string;
    permissions?: string[];
    bidPermissions?: string[];
    status?: string;
  }) => {
    try {
      // Call the API to create the user in the database
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await response.json();
      console.log('User created in database:', newUser);

      // Refresh the users list
      const updatedResponse = await fetch('/api/users');
      if (updatedResponse.ok) {
        const updatedUsers = await updatedResponse.json();
        // setUsers(updatedUsers);
      }

      setIsAddUserModalOpen(false);
      toast({
        title: 'User Invited',
        description: `User ${data.email} has been invited successfully`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle updating a user
  const handleUpdateUser = (
    userId: number,
    updatedData: UpdateUserRequestData
  ) => {
    updateUser({ id: userId.toString(), data: updatedData });
  };

  // Handle deleting a user
  const handleDeleteUser = (userId: number) => {
    deleteUser(userId.toString());
  };

  // Handle deactivating/activating a user
  const handleToggleUserStatus = (userId: number) => {
    if (confirmationAction == 'activate') {
      activateUser({ id: `${userId}/activate`, data: {} });
    } else if (confirmationAction == 'deactivate') {
      deactivateUser({ id: `${userId}/deactivate`, data: {} });
    }
  };

  // Handle confirmation modal actions
  const handleConfirmAction = () => {
    if (!selectedUser) return;

    if (confirmationAction === 'delete') {
      handleDeleteUser(selectedUser?.id);
    } else if (
      confirmationAction === 'deactivate' ||
      confirmationAction == 'activate'
    ) {
      handleToggleUserStatus(selectedUser.id);
    }
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

  // Get primary role for display
  const getPrimaryRole = (user: User): string => {
    // Order of precedence: Group Admin > District Admin > School Admin > Viewer

    return user.roles[0]?.type || 'User';
  };

  // Get primary bid role for display
  const getPrimaryBidRole = (user: User): string => {
    // Order of precedence: Bid Administrator > Bid Manager > Bid Viewer > None
    if (user.bidRoles.some((role) => role.type === 'Bid Administrator'))
      return 'Bid Administrator';
    // Check if user is assigned as a manager to any bids
    if (user.managedBids && user.managedBids.length > 0) return 'Bid Manager';
    if (user.bidRoles.some((role) => role.type === 'Bid Viewer'))
      return 'Bid Viewer';
    return 'None';
  };

  // Get district names for display
  const getDistrictNames = (user: User): string => {
    // First try to get districts from the user's roles
    const districtRoles = user.roles.filter(
      (role) => role.scope.type === 'District'
    );

    if (districtRoles.length > 0) {
      return districtRoles
        .map((role) => {
          // If the role scope has a name, use it
          if (role.scope.type) return role.scope.type;

          // Otherwise look up the name from mockDistricts
          const district = mockDistricts.find(
            (d) => d.id.toString() === role.scope.id
          );
          return district ? district.name : role.scope.id;
        })
        .join(', ');
    }

    // If no districts found in roles, check if user has a district property
    // if (user.districtId) {
    //   if (typeof user.districtId === 'string') {
    //     // If district is a string (ID), look up the name
    //     const district = mockDistricts.find((d) => d.id === user.districtId);
    //     return district ? district.name : user.districtId;
    //   } else if (user.districtId) {
    //     // If district is an object with an ID, look up the name
    //     const district = mockDistricts.find((d) => d.id === user.districtId);
    //     return district ? district.name : user.districtId.toString();
    //   }
    // }

    // If user has a school role, get the district from the school
    const schoolRoles = user.roles.filter(
      (role) => role.scope.type === 'school'
    );
    if (schoolRoles.length > 0) {
      const schoolIds = schoolRoles.map((role) => role.scope.id);
      const districts = new Set<string>();

      schoolIds.forEach((schoolId) => {
        const school = mockSchools.find((s) => s.id === schoolId.toString());
        if (school) {
          const district = mockDistricts.find(
            (d) => d.id.toString() === school.districtId
          );
          if (district) {
            districts.add(district.name);
          }
        }
      });

      if (districts.size > 0) {
        return Array.from(districts).join(', ');
      }
    }

    return 'None';
  };

  // Get school names for display
  const getSchoolNames = (user: User): string => {
    // First try to get schools from the user's roles
    const schoolRoles = user.roles.filter(
      (role) => role.scope.type === 'school'
    );

    if (schoolRoles.length > 0) {
      return schoolRoles
        .map((role) => {
          // If the role scope has a name, use it
          if (role.scope.name) return role.scope.name;

          // Otherwise look up the name from mockSchools
          const school = mockSchools.find((s) => s.id === role.scope.id);
          return school ? school.name : role.scope.id;
        })
        .join(', ');
    }

    // If no schools found in roles, check if user has a school property
    // if (user.school) {
    //   if (typeof user.school === 'string') {
    //     // If school is a string (ID), look up the name
    //     const school = mockSchools.find((s) => s.id === user.school);
    //     return school ? school.name : user.school;
    //   } else if (user.school.name) {
    //     // If school is an object with a name, use it
    //     return user.school.name;
    //   } else if (user.school.id) {
    //     // If school is an object with an ID, look up the name
    //     const school = mockSchools.find((s) => s.id === user.school.id);
    //     return school ? school.name : user.school.id;
    //   }
    // }

    return 'None';
  };

  // Check if current user can edit another user
  const canEditUser = (user: User): boolean => {
    if (!currentUser) return false;

    // Can't edit yourself
    if (currentUser.id === user.id) return false;

    // Group Admins can edit anyone
    if (hasRole(currentUser, 'Group Admin')) return true;

    // Get the user's district IDs
    const userDistrictIds = getUserEntities(currentUser, 'District').map(
      (entity) => entity.id
    );

    // Co-op Admins can edit users in their co-op
    if (hasRole(currentUser, 'Group Admin')) {
      const userCoopIds = getUserEntities(currentUser, 'coop').map(
        (entity) => entity.id
      );
      // Check if the user belongs to any of the current user's co-ops
      for (const coopId of userCoopIds) {
        if (
          user.roles.some(
            (role) =>
              role.scope.type === 'coop' && role.scope.id === coopId.toString()
          )
        ) {
          return true;
        }
      }
    }

    // District Admins can edit users in their district
    if (hasRole(currentUser, 'District Admin')) {
      // Check if the user belongs to any of the current user's districts
      for (const districtId of userDistrictIds) {
        // Check for direct district role
        if (
          user.roles.some(
            (role) =>
              role.scope.type === 'district' &&
              role.scope.id === districtId.toString()
          )
        ) {
          return true;
        }

        // Check for school role where the school belongs to this district
        if (
          user.roles.some((role) => {
            if (role.scope.type === 'school') {
              const schoolId = role.scope.id;
              const school = mockSchools.find(
                (s) => s.id === schoolId.toString()
              );
              return school && school.districtId === districtId.toString();
            }
            return false;
          })
        ) {
          return true;
        }
      }
    }

    return false;
  };

  // Function to handle bulk upload
  const handleBulkUpload = () => {
    console.log('Opening bulk upload modal');
    setIsBulkUploadModalOpen(true);
  };

  // Function to handle export users
  const handleExportUsers = () => {
    toast({
      title: 'Exporting Users',
      description: 'Your users are being exported to a spreadsheet.',
      variant: 'success',
    });
  };

  // Function to handle applying filters
  const handleApplyFilters = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.role !== 'all') count++;
    if (filters.bidRole !== 'all') count++;
    if (filters.status.length < 3) count++;
    if (filters.district !== 'all') count++;
    return count;
  };

  // Column width definitions for consistent table layout
  const columnWidths = {
    name: 'w-[150px]',
    email: 'w-[200px]',
    role: 'w-[120px]',
    bidRole: 'w-[120px]',
    district: 'w-[150px]',
    school: 'w-[150px]',
    status: 'w-[100px]',
    lastLogin: 'w-[180px]',
    actions: 'w-[120px]',
  };

  // Update the formatDate function to handle null values better

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>

        <div className="flex gap-2">
          <Button variant="default" onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters button */}
          <Button
            variant="outline"
            onClick={() => setIsFiltersModalOpen(true)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          Showing {users && users?.length > 0 ? startIndex + 1 : 0}-{endIndex}{' '}
          of {users?.length}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={handleExportUsers}
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className={`whitespace-nowrap ${columnWidths.name}`}>
                  Name
                </TableHead>
                <TableHead
                  className={`whitespace-nowrap ${columnWidths.email}`}
                >
                  Email
                </TableHead>
                <TableHead className={`whitespace-nowrap ${columnWidths.role}`}>
                  Role
                </TableHead>
                <TableHead
                  className={`whitespace-nowrap ${columnWidths.bidRole}`}
                >
                  Bid Role
                </TableHead>
                <TableHead
                  className={`whitespace-nowrap ${columnWidths.district}`}
                >
                  District
                </TableHead>
                <TableHead
                  className={`whitespace-nowrap ${columnWidths.school}`}
                >
                  School
                </TableHead>
                <TableHead
                  className={`whitespace-nowrap ${columnWidths.status}`}
                >
                  Status
                </TableHead>
                <TableHead
                  className={`whitespace-nowrap ${columnWidths.lastLogin}`}
                >
                  Last Login
                </TableHead>
                <TableHead
                  className={`text-right whitespace-nowrap ${columnWidths.actions}`}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500 h-[400px]"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : currentItems?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500 h-[400px]"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems?.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } cursor-pointer hover:bg-blue-50 h-12 ${
                      currentUser?.id === user.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditMode(false);
                      setIsViewUserModalOpen(true);
                    }}
                  >
                    <TableCell className={`font-medium ${columnWidths.name}`}>
                      {user.firstName + ' ' + user.lastName}
                    </TableCell>
                    <TableCell className={columnWidths.email}>
                      {user.email}
                    </TableCell>
                    <TableCell className={columnWidths.role}>
                      {getPrimaryRole(user)}
                    </TableCell>
                    <TableCell className={columnWidths.bidRole}>
                      {getPrimaryBidRole(user)}
                    </TableCell>
                    <TableCell className={columnWidths.district}>
                      {getDistrictNames(user)}
                    </TableCell>
                    <TableCell className={columnWidths.school}>
                      {getSchoolNames(user)}
                    </TableCell>
                    <TableCell className={columnWidths.status}>
                      {user.status === 'Active' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          <Check className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      )}
                      {user.status === 'Inactive' && (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          <X className="mr-1 h-3 w-3" />
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
                    </TableCell>
                    <TableCell className={columnWidths.lastLogin}>
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${columnWidths.actions}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="View User Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setIsEditMode(false);
                            setIsViewUserModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>

                        {canEditUser(user) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                setIsEditMode(true);
                                setIsViewUserModalOpen(true);
                              }}
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);

                                if (user.status === 'Active') {
                                  setConfirmationAction('deactivate');
                                  setIsConfirmationModalOpen(true);
                                } else {
                                  setConfirmationAction('activate');
                                  setIsConfirmationModalOpen(true);
                                }
                              }}
                              title={
                                user.status === 'Active'
                                  ? 'Deactivate User'
                                  : 'Activate User'
                              }
                            >
                              {user.status === 'Active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {user.status === 'Active'
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {/* Add empty rows to maintain consistent height when fewer results */}
              {/* {!isLoading &&
                currentItems?.length > 0 &&
                currentItems?.length < itemsPerPage &&
                Array(itemsPerPage - currentItems?.length)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow
                      key={`empty-${index}`}
                      className={`${
                        (currentItems?.length + index) % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50'
                      } h-12`}
                    >
                      <TableCell
                        colSpan={9}
                        className="border-b border-gray-200"
                      >
                        &nbsp;
                      </TableCell>
                    </TableRow>
                  ))} */}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={`${itemsPerPage} per page`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Select
            value={currentPage.toString()}
            onValueChange={(value) => setCurrentPage(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={`Page ${currentPage}`} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Page {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-gray-500">of {totalPages}</span>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onInvite={handleAddUser}
        currentUser={currentUser}
      />

      {/* Confirmation Modal for Delete/Deactivate */}
      {selectedUser && (
        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={
            confirmationAction === 'delete'
              ? 'Delete User'
              : confirmationAction === 'activate'
              ? 'Activate User'
              : 'Deactivate User'
          }
          description={
            confirmationAction === 'delete'
              ? `Are you sure you want to delete ${
                  selectedUser.firstName + ' ' + selectedUser.lastName
                }? This action cannot be undone.`
              : confirmationAction === 'deactivate'
              ? `Are you sure you want to deactivate ${
                  selectedUser.firstName + ' ' + selectedUser.lastName
                }? They will no longer be able to access the system.`
              : `Are you sure you want to activate ${
                  selectedUser.firstName + ' ' + selectedUser.lastName
                }?`
          }
          isLoading={
            isDeleteUserPending ||
            isPendingUserActivation ||
            isPendingUserDeactivation
          }
          confirmText={
            confirmationAction === 'delete'
              ? 'Delete'
              : confirmationAction === 'deactivate'
              ? 'Deactivate'
              : 'Activate'
          }
          cancelText="Cancel"
        />
      )}

      {/* Bulk Upload Users Modal */}
      <BulkUploadUsersModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onUpload={(newUsers) => {
          // Add the uploaded users to the existing users
          //   setUsers([...users, ...newUsers]);
          toast({
            title: 'Users Uploaded',
            description: `${newUsers.length} users have been uploaded successfully`,
            variant: 'success',
          });
        }}
      />

      {/* View/Edit User Modal */}
      {selectedUser && (
        <ViewUserModal
          isOpen={isViewUserModalOpen}
          onClose={() => {
            setIsViewUserModalOpen(false);
            setIsEditMode(false);
          }}
          user={selectedUser}
          onToggleActivation={() => {
            setIsViewUserModalOpen(false);
            setConfirmationAction(
              selectedUser.status == 'Active' ? 'deactivate' : 'activate'
            );
            setIsConfirmationModalOpen(true);
          }}
          onDelete={() => {
            setIsViewUserModalOpen(false);
            setConfirmationAction('delete');
            setIsConfirmationModalOpen(true);
          }}
          isLoading={isUpdateUserPending}
          onSave={handleUpdateUser}
          currentUser={currentUser}
          isEditMode={isEditMode}
        />
      )}

      {/* Filters Modal */}
      <UserFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
