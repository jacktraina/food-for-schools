'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  BarChart3,
  Building,
  Download,
  Edit,
  MapPin,
  Users,
  X,
  Play,
  Pause,
  PlusCircle,
  Archive,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast-context';
import { hasRole } from '@/types/user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ViewSchoolModal } from '@/components/dashboard/view-school-modal';
import { AddSchoolModal } from '@/components/district/AddSchoolModal';
import { useRouter } from 'next/navigation';
import { ManageBidParticipationModal } from '@/components/dashboard/manage-bid-participation-modal';
import {
  useApiQuery,
  useDeleteMutation,
  usePostMutation,
  usePutMutation,
} from '@/hooks/use-api';
import type { DistrictResponse, UpdateDistrictPayload } from '@/types/district';
import type { LoginResponseUser, Meta } from '@/types/auth';
import { DistrictForm } from '@/components/district/DistrictForm';
import { AxiosError } from 'axios';
import { CreateSchoolPayload } from '@/schemas/schoolSchema';

// Bid categories for the search functionality
const bidCategories = [
  { id: '1', name: 'Bagel' },
  { id: '2', name: 'Bread' },
  { id: '3', name: 'Dairy' },
  { id: '4', name: 'Desks' },
  { id: '5', name: 'Fresh Produce' },
  { id: '6', name: 'Frozen Foods' },
  { id: '7', name: 'Office Supplies' },
  { id: '8', name: 'Paper Products' },
  { id: '9', name: 'Technology' },
  { id: '10', name: 'Cleaning Supplies' },
  { id: '11', name: 'Food Service Equipment' },
  { id: '12', name: 'Maintenance Supplies' },
];

// Helper function to get bid description
const getBidDescription = (bidName: string) => {
  const descriptions: Record<string, string> = {
    Bagel: 'Fresh and frozen bagel products for breakfast programs',
    Bread:
      'Fresh bread products including sandwich bread, rolls, and specialty items',
    Dairy: 'Milk, cheese, yogurt, and other dairy products for meal programs',
    Desks: 'Student desks, chairs, and classroom furniture',
    'Fresh Produce': 'Fresh fruits and vegetables for healthy meal options',
    'Frozen Foods': 'Frozen meal components, vegetables, and prepared foods',
    'Office Supplies':
      'General office supplies, paper, pens, and administrative materials',
    'Paper Products':
      'Paper plates, napkins, cups, and disposable food service items',
    Technology:
      'Computer equipment, tablets, interactive boards, and educational technology',
    'Cleaning Supplies':
      'Janitorial supplies, disinfectants, and maintenance products',
    'Food Service Equipment':
      'Kitchen equipment, serving lines, and food preparation tools',
    'Maintenance Supplies': 'General maintenance and repair supplies',
  };
  return descriptions[bidName] || 'No description available';
};

// Helper function to get default participating schools (all schools by default)
const getDefaultParticipatingSchools = (allSchoolIds: string[]) => {
  return allSchoolIds;
};

function DistrictDetails({ id }: { id: string }) {
  const [deleteSchoolModalOpen, setDeleteSchoolModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<number | null>(null);
  //   const [viewSchoolModalOpen, setViewSchoolModalOpen] = useState(false);
  const [addSchoolModalOpen, setAddSchoolModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);

  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [schoolToToggle, setSchoolToToggle] = useState<number | null>(null);
  const [activationAction, setActivationAction] = useState<
    'activate' | 'deactivate'
  >('deactivate');

  const [newCategory, setNewCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isCategoryInputFocused, setIsCategoryInputFocused] = useState(false);

  const [manageBidsModalOpen, setManageBidsModalOpen] = useState(false);
  const [participatingBids, setParticipatingBids] = useState<any[]>([]);

  const router = useRouter();

  const { data: district, refetch } = useApiQuery<DistrictResponse>(
    `/district/${id}`,
    ['district', id]
  );

  const { mutate: updateDistrict } = usePutMutation<
    Partial<UpdateDistrictPayload>,
    Meta
  >('/district', {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'District information has been updated successfully.',
        variant: 'success',
      });
      refetch();
      setIsEditing(false);
    },
    onError: (error: AxiosError<Meta>) => {
      toast({
        title: 'Error',
        description: `${
          error?.response?.data?.error || 'Failed to update District'
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
    });

  const { mutate: createSchool, isPending: isPendingCreateSchool } =
    usePostMutation<CreateSchoolPayload, Meta>(`/schools/${district?.id}`, {
      onSuccess: () => {
        setAddSchoolModalOpen(false);
        toast({
          title: 'Success',
          description: `School has been added successfully.`,
          variant: 'success',
        });
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to add School'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!district?.id,
    });

  const { mutate: deactivateSchool, isPending: isPendingSchoolDeactivation } =
    usePutMutation<{}, Meta>(`/schools/${district?.id}`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'School has been deactivated successfully.',
          variant: 'success',
        });
        refetch();
        setActivationModalOpen(false);
        setSchoolToToggle(null);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to deactivate School'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!district?.id && !!schoolToToggle,
    });

  const { mutate: activateSchool, isPending: isPendingSchoolActivation } =
    usePutMutation<{}, Meta>(`/schools/${district?.id}`, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'School has been activated successfully.',
          variant: 'success',
        });
        refetch();
        setActivationModalOpen(false);
        setSchoolToToggle(null);
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to activate School'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!district?.id && !!schoolToToggle,
    });

  const { mutate: deleteSchool } = useDeleteMutation<Meta>(
    `/schools/${district?.id}`,
    {
      onSuccess: () => {
        toast({
          title: 'School Deleted',
          description:
            'The school has been successfully removed from this district.',
          variant: 'success',
        });
        refetch();
      },
      onError: (error: AxiosError<Meta>) => {
        toast({
          title: 'Error',
          description: `${
            error?.response?.data?.error || 'Failed to delete school'
          }`,
          variant: 'destructive',
        });
      },
      enabled: !!district?.id && !!schoolToDelete,
    }
  );

  // Load user data and district data
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

    setIsLoading(false);
  }, [id]);

  // Load available bid categories
  useEffect(() => {
    const categories = bidCategories.map((cat) => cat.name);
    setAvailableCategories(categories);
  }, []);

  // Check if user can edit district information
  const canEditDistrict = () => {
    if (!userData) return false;

    // Co-op Admin can edit any district
    if (hasRole(userData, 'Group Admin')) return true;

    // District Admin can only edit their own district
    if (hasRole(userData, 'District Admin', 'District', 2)) {
      return true;
    }

    // School Admin and other roles cannot edit district information
    return false;
  };

  // Check if user can add/edit/delete schools
  const canManageSchools = () => {
    if (!userData) return false;

    // Co-op Admin can manage schools in any district
    if (hasRole(userData, 'Group Admin')) return true;

    // District Admin can only manage schools in their own district
    if (hasRole(userData, 'District Admin', 'District', 2)) {
      return true;
    }

    // School Admin can only edit their own school, not add/delete
    return false;
  };

  // Check if user can edit a specific school
  const canEditSchool = (schoolId: string) => {
    if (!userData) return false;

    // Co-op Admin can edit any school
    if (hasRole(userData, 'Group Admin')) return true;

    // District Admin can edit schools in their district
    if (hasRole(userData, 'District Admin', 'District', 2)) {
      return true;
    }

    // School Admin can only edit their assigned school
    if (hasRole(userData, 'School Admin', 'school', 3)) {
      return true;
    }

    return false;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditDistrict = (
    updatedDistrict: Partial<UpdateDistrictPayload>
  ) => {
    updateDistrict({
      id: district?.id.toString() || '',
      data: updatedDistrict,
    });
  };

  const handleDeleteDistrict = (id: number) => {
    deleteDistrict(id.toString());
  };

  const handleDeactivateDistrict = (id: number) => {
    deactivateDistrict({ id: `${id}/deactivate`, data: {} });
  };

  const handleAddSchool = (newSchool: CreateSchoolPayload) => {
    createSchool(newSchool);
  };

  const handleDeleteSchoolClick = (schoolId: number) => {
    const school = district?.schools?.find((s) => s.id === schoolId);
    setSelectedSchool(school);
    setSchoolToDelete(schoolId);
    setDeleteSchoolModalOpen(true);
  };

  const handleConfirmDeleteSchool = () => {
    if (schoolToDelete) {
      deleteSchool(schoolToDelete.toString());
    }
    setDeleteSchoolModalOpen(false);
    setSchoolToDelete(null);
  };

  const handleCancelDeleteSchool = () => {
    setDeleteSchoolModalOpen(false);
    setSchoolToDelete(null);
  };

  const handleToggleActivationClick = (
    schoolId: number,
    currentStatus: string
  ) => {
    const school = district?.schools?.find((s) => s.id === schoolId);
    setSelectedSchool(school);
    setSchoolToToggle(schoolId);
    setActivationAction(currentStatus === 'Active' ? 'deactivate' : 'activate');
    setActivationModalOpen(true);
  };

  const handleConfirmToggleActivation = () => {
    if (activationAction === 'deactivate') {
      deactivateSchool({ id: `${schoolToToggle}/archive`, data: {} });
    } else if (activationAction === 'activate') {
      activateSchool({ id: `${schoolToToggle}/activate`, data: {} });
    }
  };

  const handleCancelToggleActivation = () => {
    setActivationModalOpen(false);
    setSchoolToToggle(null);
  };

  const handleSaveBidParticipation = (updatedBids: any[]) => {
    setParticipatingBids(updatedBids);
    setManageBidsModalOpen(false);
    toast({
      title: 'Success',
      description: 'Bid participation has been updated successfully.',
      variant: 'success',
    });
  };

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Only show the Back button for Coop users */}
      {userData && hasRole(userData, 'Group Admin') && (
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/districts" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>View Group</span>
            </Link>
          </Button>
        </div>
      )}

      {district && (
        <div className="space-y-6">
          {/* Update the district detail section to include the logo */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                <img
                  src={'/school-district-default-logo.png'}
                  alt={`${district?.name} Logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/school-district-default-logo.png';
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {district?.name}
                </h1>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="mr-1 h-4 w-4" />
                  {district?.address?.street_address_1}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Schools
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {district.schools?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {district.schools
                    ?.reduce(
                      (total, school) => total + school.enrollment! || 0,
                      0
                    )
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Annual Budget
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${district.annual_budget}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>District Information</CardTitle>
                <CardDescription className="mt-2">
                  Detailed information about {district.name}.
                </CardDescription>
              </div>
              {canEditDistrict() &&
                (isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Information
                  </Button>
                ))}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <DistrictForm
                  district={district}
                  onSave={(updatedDistrict) =>
                    handleEditDistrict(updatedDistrict)
                  }
                  onCancel={handleCancelEdit}
                />
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-3">
                      Primary Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          District Name
                        </h4>
                        <p>{district.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Director Name
                        </h4>
                        <p>{district.director_name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Phone
                        </h4>
                        <p>{district.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Email
                        </h4>
                        <p>{district.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Fax
                        </h4>
                        <p>{district.fax || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          District Enrollment
                        </h4>
                        <p>{district.district_enrollment}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          RA Number
                        </h4>
                        <p>{district.ra_number}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Address
                      </h4>
                      <p>
                        {district.address ? (
                          <>
                            {district.address.city &&
                              district.address.state && (
                                <>
                                  {district.address.city},{' '}
                                  {district.address.state}{' '}
                                  {district.address.zip_code || ''}
                                </>
                              )}
                          </>
                        ) : (
                          'No address provided'
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="mb-6">
                    <h3 className="text-base font-medium mb-3">
                      Secondary Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Contact Name
                        </h4>
                        <p>
                          {district.secondary_contact_name || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Contact Phone
                        </h4>
                        <p>
                          {district.secondary_contact_phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Contact Email
                        </h4>
                        <p>
                          {district.secondary_contact_email || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="mb-6">
                    <h3 className="text-base font-medium mb-3">
                      Billing Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Billing Contact
                        </h4>
                        <p>
                          {district.billing_contact_name
                            ? district.billing_contact_name
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Billing Phone
                        </h4>
                        <p>
                          {district.billing_contact_phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Billing Email
                        </h4>
                        <p>
                          {district.billing_contact_email || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Billing Address
                      </h4>
                      <p>
                        {district.billing_address ? (
                          <>
                            {district.billing_address.city &&
                              district.billing_address.state && (
                                <>
                                  {district.billing_address.city},{' '}
                                  {district.billing_address.state}{' '}
                                  {district.billing_address.zip_code || ''}
                                </>
                              )}
                          </>
                        ) : (
                          'No billing address provided'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-6" />
              {canEditDistrict() && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleteDistrictPending}
                    onClick={() => handleDeleteDistrict(district.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPendingDeactivation}
                    onClick={() => handleDeactivateDistrict(district.id)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Participating Bids</CardTitle>
                <CardDescription className="mt-2">
                  Bids that {district.name} is participating in and school
                  participation details.
                </CardDescription>
              </div>
              {canEditDistrict() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManageBidsModalOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Manage Bid Participation
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {participatingBids && participatingBids.length > 0 ? (
                <div className="space-y-4">
                  {participatingBids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{bid.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {bid.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>
                              Status:{' '}
                              <Badge variant="outline" className="ml-1">
                                {bid.status}
                              </Badge>
                            </span>
                            <span>Year: {bid.bidYear}</span>
                            <span>Type: {bid.awardType}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">
                          Participating Schools ({district.schools?.length || 0}{' '}
                          of {district.schools?.length || 0})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {district.schools && district.schools.length > 0 ? (
                            district.schools.map((school) => (
                              <Badge
                                key={school.id}
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                {school.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No schools participating
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    This district is not currently participating in any bids.
                  </p>
                  {canEditDistrict() && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setManageBidsModalOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Bid Participation
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white pb-6">
              <div>
                <CardTitle>Schools in {district.name}</CardTitle>
                <CardDescription className="pt-2">
                  A list of all schools in this district.
                </CardDescription>
              </div>
              {canManageSchools() && (
                <Button size="sm" onClick={() => setAddSchoolModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add School
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <style jsx global>{`
                .inactive-row {
                  opacity: 0.7;
                  color: #6b7280; /* gray-500 */
                }
              `}</style>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-t border-b">
                    <TableHead className="py-3">Name</TableHead>
                    <TableHead className="py-3">Enrollment</TableHead>
                    <TableHead className="py-3">Shipping Address</TableHead>
                    <TableHead className="py-3">School Contact</TableHead>
                    <TableHead className="py-3">Status</TableHead>
                    <TableHead className="text-right py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {district.schools?.map((school, index) => (
                    <TableRow
                      key={school.id}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } 
                         ${school.status === 'Inactive' ? 'inactive-row' : ''}
                      hover:bg-gray-100 transition-colors`}
                    >
                      <TableCell className="font-medium p-0">
                        <Link
                          href={`/dashboard/schools/${school.id}?districtId=${district.id}`}
                          className="flex items-center px-4 py-3 w-full h-full"
                          onClick={(e) => {
                            // Don't navigate if clicking on action buttons
                            if (
                              (e.target as HTMLElement).closest(
                                '.action-button-container'
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {school.name}
                          {userData &&
                            hasRole(
                              userData,
                              'School Admin',
                              'school',
                              school.id
                            ) && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-green-50 text-green-700"
                              >
                                Your School
                              </Badge>
                            )}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link
                          href={`/dashboard/schools/${school.id}?districtId=${district.id}`}
                          className="flex items-center px-4 py-3 w-full h-full"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).closest(
                                '.action-button-container'
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {school.enrollment
                            ? school.enrollment.toLocaleString()
                            : '—'}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs truncate p-0">
                        <Link
                          href={`/dashboard/schools/${school.id}?districtId=${district.id}`}
                          className="flex items-center px-4 py-3 w-full h-full"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).closest(
                                '.action-button-container'
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {school.shipping_address || '—'}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs truncate p-0">
                        <Link
                          href={`/dashboard/schools/${school.id}?districtId=${district.id}`}
                          className="flex items-center px-4 py-3 w-full h-full"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).closest(
                                '.action-button-container'
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {school.contact_first_name && school.contact_last_name
                            ? `${school.contact_first_name} ${school.contact_last_name}`
                            : '—'}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link
                          href={`/dashboard/schools/${school.id}?districtId=${district.id}`}
                          className="flex items-center px-4 py-3 w-full h-full"
                          onClick={(e) => {
                            if (
                              (e.target as HTMLElement).closest(
                                '.action-button-container'
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Badge
                            variant="outline"
                            className={
                              school.status === 'Active' || !school.status
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
                            }
                          >
                            {school.status || 'Active'}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 items-center action-button-container">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/dashboard/schools/${school.id}?districtId=${district.id}`
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          {canManageSchools() && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActivationClick(
                                    school.id,
                                    school.status
                                  );
                                }}
                              >
                                {school.status === 'Active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                                <span className="sr-only">
                                  {school.status === 'Active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchoolClick(school.id);
                                }}
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

          {/* School Modals */}
          {selectedSchool && (
            <>
              {/* <ViewSchoolModal
                school={selectedSchool}
                open={viewSchoolModalOpen}
                onOpenChange={setViewSchoolModalOpen}
                onEdit={
                  canEditSchool(selectedSchool.id)
                    ? () => handleEditSchool(selectedSchool)
                    : undefined
                }
                readOnly={!canEditSchool(selectedSchool.id)}
              /> */}

              {/* <EditSchoolModal
                district={district}
                school={selectedSchool}
                open={editSchoolModalOpen}
                onOpenChange={setEditSchoolModalOpen}
                onSave={handleSaveSchool}
              /> */}

              <ConfirmationModal
                isOpen={deleteSchoolModalOpen}
                onClose={handleCancelDeleteSchool}
                onConfirm={handleConfirmDeleteSchool}
                title={`Delete ${selectedSchool.name}`}
                description="Are you sure you want to delete this school? This action cannot be undone and all associated data will be permanently removed."
                confirmText="Delete"
                cancelText="Cancel"
              />
            </>
          )}

          {/* Add School Modal */}
          <AddSchoolModal
            open={addSchoolModalOpen}
            onOpenChange={setAddSchoolModalOpen}
            onAdd={(newSchool) => handleAddSchool(newSchool)}
            isLoading={isPendingCreateSchool}
            districtBillingInfo={{
              billingContact: district.billing_contact_name || '',
              billingAddress: district.billing_address?.street_address_1 || '',
              billingPhone: district.billing_contact_phone || '',
              billingEmail: district.billing_contact_email || '',
            }}
          />

          {/* Activation/Deactivation Modal */}
          <ConfirmationModal
            isOpen={activationModalOpen}
            onClose={handleCancelToggleActivation}
            onConfirm={handleConfirmToggleActivation}
            title={
              activationAction === 'activate'
                ? 'Activate School'
                : 'Deactivate School'
            }
            description={`Are you sure you want to ${activationAction} ${
              selectedSchool?.name
            }? ${
              activationAction === 'deactivate'
                ? 'This will make the school unavailable for new bids and purchases.'
                : 'This will make the school available for bids and purchases again.'
            }`}
            confirmText={
              activationAction === 'activate' ? 'Activate' : 'Deactivate'
            }
            isLoading={isPendingSchoolDeactivation || isPendingSchoolActivation}
            cancelText="Cancel"
          />

          {/* Manage Bids Modal */}
          <ManageBidParticipationModal
            open={manageBidsModalOpen}
            onOpenChange={setManageBidsModalOpen}
            district={district}
            schools={district.schools || []}
            participatingBids={participatingBids}
            onSave={handleSaveBidParticipation}
          />
        </div>
      )}
    </div>
  );
}

export default DistrictDetails;
