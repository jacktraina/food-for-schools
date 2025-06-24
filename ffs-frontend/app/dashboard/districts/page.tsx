'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Edit, Pause, Play, PlusCircle, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { CreateDistrictForm } from '@/components/dashboard/CreateDistrictForm';
import { BulkUploadDistrictsModal } from '@/components/dashboard/bulk-upload-districts-modal';
import { ToastContextProvider, useToast } from '@/components/ui/toast-context';
import { hasRole } from '@/lib/utils';

import {
  useApiQuery,
  useDeleteMutation,
  usePostMutation,
  usePutMutation,
} from '@/hooks/use-api';
import { CreateDistrictPayload, District } from '@/types/district';
import { LoginResponseUser, Meta } from '@/types/auth';
import { AxiosError } from 'axios';

function DistrictsContent() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const { toast } = useToast();
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [districtToToggle, setDistrictToToggle] = useState<number | null>(null);
  const [activationAction, setActivationAction] = useState<
    'activate' | 'deactivate'
  >('deactivate');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as LoginResponseUser;
        setUserData(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  const {
    data: districts,
    isLoading,
    error,
    refetch,
  } = useApiQuery<District[]>('/district', ['districts']);

  const { mutate: createDistrict, isPending: isPendingCreateDistrict } =
    usePostMutation<CreateDistrictPayload, Meta>('/district', {
      onSuccess: () => {
        toast({
          title: 'District Added',
          description: 'You have created the district successfully!',
          variant: 'success',
        });
        setAddDialogOpen(false);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error.response?.data.message ||
            'Failed to add district. Please try again.'
          }`,
          variant: 'destructive',
        });
      },
    });

  const { mutate: deactivateDistrict, isPending: isPendingDeactivation } =
    usePutMutation<{}, Meta>('/district', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'District has been deactivated successfully.',
          variant: 'success',
        });
        refetch();
        setActivationModalOpen(false);
        setDistrictToToggle(null);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to deactivate District'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!districtToToggle,
    });

  const { mutate: activateDistrict, isPending: isPendingActivation } =
    usePutMutation<{}, Meta>('/district', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'District has been activated successfully.',
          variant: 'success',
        });
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to activate District'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!districtToToggle,
    });

  const { mutate: deleteDistrict, isPending: isDeleteDistrictPending } =
    useDeleteMutation<Meta>('/district', {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'District has been deleted successfully.',
          variant: 'success',
        });
        refetch();
        setDeleteModalOpen(false);
        setDistrictToDelete(null);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to delete District'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!districtToDelete,
    });

  // Check if user can add districts
  const canAddDistrict = () => {
    if (!userData) return false;

    // Only Group Admin or District Admin can add districts
    return (
      hasRole(userData, 'Group Admin') || hasRole(userData, 'District Admin')
    );
  };

  const handleDeleteClick = (e: React.MouseEvent, districtId: number) => {
    e.stopPropagation();
    setDistrictToDelete(districtId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    deleteDistrict(districtToDelete?.toString() || '');
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDistrictToDelete(null);
  };

  const handleToggleActivationClick = (
    e: React.MouseEvent,
    districtId: number,
    currentStatus: string
  ) => {
    e.stopPropagation();
    setDistrictToToggle(districtId);
    setActivationAction(currentStatus === 'Active' ? 'deactivate' : 'activate');
    setActivationModalOpen(true);
  };

  const handleConfirmToggleActivation = async () => {
    if (activationAction === 'deactivate') {
      deactivateDistrict({
        id: `${districtToToggle}/deactivate`,
        data: {},
      });
    } else if (activationAction === 'activate') {
      activateDistrict({
        id: `${districtToToggle}/activate`,
        data: {},
      });
    }
  };

  const handleCancelToggleActivation = () => {
    setActivationModalOpen(false);
    setDistrictToToggle(null);
  };

  const handleAddDistrict = (newDistrict: CreateDistrictPayload) => {
    createDistrict(newDistrict);
  };

  const handleBulkUpload = async (newDistricts: any[]) => {
    try {
      const response = await fetch('/api/districts/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ districts: newDistricts }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk upload districts: ${response.status}`);
      }

      const addedDistricts = await response.json();

      // Add all the new districts to the list
      const districtsWithStats = addedDistricts.map((district: any) => ({
        ...district,
        location: `${district.city || ''}, ${district.state || ''}`,
        schools: 0,
        students: 0,
        status: district.status || 'Active',
      }));

      toast({
        title: 'Districts Added',
        description: `${newDistricts.length} districts have been successfully added.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to bulk upload districts:', error);
      toast({
        title: 'Error',
        description: 'Failed to bulk upload districts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBulkUploadOpen(false);
    }
  };

  const handleRowClick = (districtId: number) => {
    router.push(`/dashboard/districts/${districtId}`);
  };

  // Only hide this page for School Admins or Viewers with district scope, not District Admins
  const isDistrictAdmin = userData?.roles.some(
    (role) => role.type === 'District Admin'
  );
  const hasDistrictScope = userData?.roles.some(
    (role) => role.scope.type === 'District'
  );
  const hasCoopScope = userData?.roles.some(
    (role) => role.scope.type === 'coop'
  );

  if (hasDistrictScope && !isDistrictAdmin && !hasCoopScope) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">
          Error loading districts:{' '}
          {error.response?.data.error || 'Failed to fetch district data'}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Group Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all districts in your cooperative.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          {canAddDistrict() && (
            <Button
              variant="default"
              className="cursor-pointer"
              onClick={() => setAddDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add District
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm hover:shadow transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-gray-200">
              <img
                src="/coop-default-logo.png"
                alt="Cooperative Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/coop-default-logo.png';
                }}
              />
            </div>
            <CardTitle>
              <div>
                <h1 className="text-2xl font-bold">
                  Food For Schools Cooperative
                </h1>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <style jsx global>{`
            .clickable-row {
              cursor: pointer;
            }
            .clickable-row:hover td {
              background-color: #eff6ff !important; /* blue-50 */
            }
            .clickable-row:hover {
              outline: 1px solid #dbeafe; /* blue-100 */
            }
            .inactive-row {
              opacity: 0.7;
              color: #6b7280; /* gray-500 */
            }
            .inactive-row:hover {
              opacity: 0.9;
            }
          `}</style>
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-t border-b">
                <TableHead className="py-3">Name</TableHead>
                <TableHead className="py-3">Location</TableHead>
                <TableHead className="py-3">Schools</TableHead>
                <TableHead className="py-3">Students</TableHead>
                <TableHead className="py-3">Status</TableHead>
                <TableHead className="text-right py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districts &&
                districts.map((district, index) => (
                  <TableRow
                    key={district.id}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } clickable-row ${
                      district.status === 'Inactive' ? 'inactive-row' : ''
                    }`}
                    onClick={() => handleRowClick(district.id)}
                  >
                    <TableCell className="font-medium">
                      {district.name}
                    </TableCell>
                    <TableCell>{district.location}</TableCell>
                    <TableCell>{district.schools}</TableCell>
                    <TableCell>{district.students.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          district.status === 'Active'
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
                        }
                      >
                        {district.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer relative z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/districts/${district.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {canAddDistrict() && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-50 cursor-pointer relative z-10"
                              onClick={(e) =>
                                handleToggleActivationClick(
                                  e,
                                  district.id,
                                  district?.status || 'Inactive'
                                )
                              }
                            >
                              {district.status === 'Active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {district.status === 'Active'
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer relative z-10"
                              onClick={(e) => handleDeleteClick(e, district.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteDistrictPending}
        title="Delete District"
        description="Are you sure you want to delete this district? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={activationModalOpen}
        onClose={handleCancelToggleActivation}
        onConfirm={handleConfirmToggleActivation}
        isLoading={isPendingDeactivation || isPendingActivation}
        title={
          activationAction === 'activate'
            ? 'Activate District'
            : 'Deactivate District'
        }
        description={`Are you sure you want to ${activationAction} this district? ${
          activationAction === 'deactivate'
            ? 'This will make the district and its schools unavailable for new bids and purchases.'
            : 'This will make the district and its schools available for bids and purchases again.'
        }`}
        confirmText={
          activationAction === 'activate' ? 'Activate' : 'Deactivate'
        }
        cancelText="Cancel"
      />

      <CreateDistrictForm
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddDistrict}
        isLoading={isPendingCreateDistrict}
        onBulkUpload={() => {
          setAddDialogOpen(false);
          setBulkUploadOpen(true);
        }}
      />

      <BulkUploadDistrictsModal
        isOpen={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  );
}

export default function DistrictsPage() {
  return (
    <ToastContextProvider>
      <DistrictsContent />
    </ToastContextProvider>
  );
}
