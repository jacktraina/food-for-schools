'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  School,
  Edit,
  Users,
  Building,
  MapPin,
  Save,
  X,
  ChevronRight,
} from 'lucide-react';
import { hasRole } from '@/types/user';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast-context';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import type { LoginResponseUser, Meta } from '@/types/auth';
import { useSearchParams } from 'next/navigation';
import { useApiQuery, usePutMutation } from '@/hooks/use-api';
import type { GetSchoolDetailsResponse } from '@/types/school';
import type { DistrictResponse } from '@/types/district';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UpdateSchoolRequestSchema,
  type UpdateSchoolFormValues,
  transformSchoolToFormValues,
} from '@/schemas/schoolSchema';
import { AxiosError } from 'axios';

export default function SchoolPageContent({ schoolId }: { schoolId: string }) {
  const searchParams = useSearchParams();
  const districtId = searchParams.get('districtId');
  const [userData, setUserData] = useState<LoginResponseUser | null>(null);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: school,
    isLoading,
    refetch,
  } = useApiQuery<GetSchoolDetailsResponse>(
    `/schools/${districtId}/${schoolId}/details`,
    ['schools', districtId || '', schoolId]
  );

  const { mutate: updateSchool, isPending: isUpdateSchoolPending } =
    usePutMutation<Partial<UpdateSchoolFormValues>, Meta>(
      `/schools/${districtId}`,
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'School information has been updated successfully.',
            variant: 'success',
          });
          refetch();
          setIsEditing(false);
        },
        onError: (error: AxiosError<Meta>) => {
          toast({
            title: 'Error',
            description: `${
              error?.response?.data?.message || 'Failed to update school'
            }`,
            variant: 'destructive',
          });
        },
        enabled: !!schoolId || !districtId,
      }
    );

  const { data: district } = useApiQuery<DistrictResponse>(
    `/district/${districtId}`,
    ['district', districtId?.toString() || ''],
    {
      enabled: !!districtId,
    }
  );

  const form = useForm<UpdateSchoolFormValues>({
    resolver: zodResolver(UpdateSchoolRequestSchema),
    defaultValues: {},
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = form;
  const watchOverrideBilling = watch('override_district_billing');

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
  }, [schoolId]);

  // Reset form when school data changes
  useEffect(() => {
    if (school) {
      const formValues = transformSchoolToFormValues(school);
      reset(formValues);
    }
  }, [school, reset]);

  // Helper function to get the school logo
  const getSchoolLogo = () => {
    return '/school-district-default-logo.png';
  };

  // Helper function to get full name from first and last name
  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '';
    if (!firstName) return lastName;
    if (!lastName) return firstName;
    return `${firstName} ${lastName}`;
  };

  // Check if user can edit school information
  const canEditSchool = () => {
    if (!userData || !school) return false;

    // Group Admin can edit any school
    if (hasRole(userData, 'Group Admin')) return true;

    // District Admin can edit schools in their district
    if (district && hasRole(userData, 'District Admin')) {
      return true;
    }

    // School Admin can only edit their assigned school
    if (hasRole(userData, 'School Admin', 'school', Number(schoolId))) {
      return true;
    }

    return false;
  };

  const handleEditToggle = () => {
    if (isEditing && school) {
      const formValues = transformSchoolToFormValues(school);
      reset(formValues);
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: UpdateSchoolFormValues) => {
    updateSchool({ id: schoolId, data });
  };

  //   const removeBidParticipation = (bidToRemove: string) => {
  //     const currentBids = form.getValues('participatingIn') || [];
  //     const updatedBids = currentBids.filter((bid) => bid !== bidToRemove);
  //     form.setValue('participatingIn', updatedBids);
  //   };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading school information...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">
            School not found
          </p>
          <p className="mt-2 text-gray-600">
            The school you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              href={`/dashboard/districts/${school.districtId}`}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <Building className="w-4 h-4 mr-2" />
              {district?.name || 'District'}
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {school.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-gray-200">
            <img
              src={getSchoolLogo() || '/placeholder.svg'}
              alt={`${school.name} Logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="mr-1 h-4 w-4" />
              {school.addressLine1 || 'No address provided'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{school.enrollment}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">District</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {district?.name || 'Unknown'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Type</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {school.schoolType || 'Unknown'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle>School Information</CardTitle>
            <CardDescription>
              Detailed information about {school.name}.
            </CardDescription>
          </div>
          {canEditSchool() && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={isUpdateSchoolPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isUpdateSchoolPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdateSchoolPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEditToggle}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Information
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isEditing ? (
                    <>
                      <FormField
                        control={form.control}
                        name="contact_first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="First name of primary contact"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contact_last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Last name of primary contact"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contact_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Title of primary contact"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Contact phone number"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contact_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Contact email address"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Primary Contact
                        </h4>
                        <p>
                          {getFullName(
                            school.contactFirstName,
                            school.contactLastName
                          ) || 'No primary contact listed'}
                        </p>
                        {school.contactTitle && (
                          <p className="text-sm text-muted-foreground">
                            {school.contactTitle}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Contact Phone
                        </h4>
                        <p>
                          {school.contactPhone ? (
                            <a
                              href={`tel:${school.contactPhone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {school.contactPhone}
                            </a>
                          ) : (
                            'No contact phone listed'
                          )}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Contact Email
                        </h4>
                        <p>
                          {school.contactEmail ? (
                            <a
                              href={`mailto:${school.contactEmail}`}
                              className="text-blue-600 hover:underline"
                            >
                              {school.contactEmail}
                            </a>
                          ) : (
                            'No contact email listed'
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-medium mb-3">
                  Primary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isEditing ? (
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name *</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="enrollment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrollment *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="school_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select school type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="High School">
                                  High School
                                </SelectItem>
                                <SelectItem value="Middle School">
                                  Middle School
                                </SelectItem>
                                <SelectItem value="Elementary School">
                                  Elementary School
                                </SelectItem>
                                <SelectItem value="Childcare">
                                  Childcare
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="School phone number"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      <FormField
                        control={form.control}
                        name="fax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fax</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="School fax number"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="School email address"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      <FormField
                        control={form.control}
                        name="address_line_1"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Street address"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address_line_2"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apartment, suite, unit, etc. (optional)"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zip_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ZIP Code"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          School Name
                        </h4>
                        <p>{school.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Address
                        </h4>
                        <p>{school.addressLine1 || 'No address provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Phone
                        </h4>
                        <p>{school.contactPhone || 'No phone provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Fax
                        </h4>
                        <p>{school.fax || 'No fax provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Email
                        </h4>
                        <p>{school.contactEmail || 'No email provided'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          School Enrollment
                        </h4>
                        <p>{school.enrollment?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          School ID
                        </h4>
                        <p>{school.id || 'No ID assigned'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-medium mb-3">
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isEditing ? (
                    <>
                      <FormField
                        control={form.control}
                        name="shipping_address_line_1"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Address Line 1 *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Street address"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shipping_address_line_2"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Address Line 2</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apartment, suite, unit, etc. (optional)"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shipping_address_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shipping_address_state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shipping_address_zip_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ZIP Code"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Instructions</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Special shipping instructions"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingDeliveryHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Hours</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Preferred delivery hours"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Shipping Address
                        </h4>
                        <p>
                          {school.shippingAddressLine1 ||
                            school.shippingAddressLine1 ||
                            'No shipping address provided'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Shipping Instructions
                        </h4>
                        <p>
                          {school.shippingInstructions ||
                            'No special instructions'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Delivery Hours
                        </h4>
                        <p>
                          {school.shippingDeliveryHours || 'Standard hours'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="override_district_billing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              Override District Billing Information
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {watchOverrideBilling ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-md">
                        <FormField
                          control={form.control}
                          name="billing_contact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="First name of billing contact"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Billing phone number"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Billing email address"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_address_line_1"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Street address"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_address_line_2"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Address Line 2</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Apartment, suite, unit, etc. (optional)"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="City"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="State"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="billing_zip_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ZIP Code"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-md bg-gray-50">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            District Billing Contact
                          </h4>
                          <p className="text-base">
                            {district?.billing_contact_name ||
                              'No billing contact provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            District Billing Address
                          </h4>
                          <p className="text-base">
                            {district?.billing_address?.street_address_1 ||
                              'No billing address provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            District Billing Phone
                          </h4>
                          <p className="text-base">
                            {district?.billing_contact_phone ||
                              'No billing phone provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            District Billing Email
                          </h4>
                          <p className="text-base">
                            {district?.billing_contact_email ||
                              'No billing email provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {school.override_district_billing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Billing Contact
                          </h4>
                          <p className="text-base">
                            {school.billingContact ||
                              'No billing contact provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Billing Address
                          </h4>
                          <p className="text-base">
                            {school.billingAddressLine1 ||
                              'No billing address provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Billing Phone
                          </h4>
                          <p className="text-base">
                            {school.billingPhone || 'No billing phone provided'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Billing Email
                          </h4>
                          <p className="text-base">
                            {school.billingEmail || 'No billing email provided'}
                          </p>
                        </div>
                        <div className="col-span-3">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            School-specific billing
                          </Badge>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-medium mb-3">Notes</h3>
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this school"
                            className="min-h-[150px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <p className="text-gray-700">
                    {school.notes || 'No notes available.'}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-medium mb-3">Participating In</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This school participates in the following bids from{' '}
                  {district?.name || 'the district'}. You can opt out of
                  specific bids for this school.
                </p>
                {/* {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {form.watch('participatingIn') &&
                      form.watch('participatingIn')!.length > 0 ? (
                        form
                          .watch('participatingIn')!
                          .map((category: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-50 flex items-center gap-1 pr-1"
                            >
                              {category}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 text-blue-700 hover:bg-blue-100 rounded-full ml-1"
                                onClick={() => removeBidParticipation(category)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">
                                  Opt out of {category}
                                </span>
                              </Button>
                            </Badge>
                          ))
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Not participating in any bids
                        </p>
                      )}
                    </div>
                    {form.watch('participatingIn') &&
                      form.watch('participatingIn')!.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Click the × button to opt this school out of specific
                          bids. To participate in additional bids, contact your
                          district administrator.
                        </p>
                      )}
                  </div>
                ) : ( */}
                <p className="text-muted-foreground">
                  Not participating in any bids
                </p>
                {/* )} */}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
