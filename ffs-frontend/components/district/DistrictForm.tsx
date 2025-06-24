'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast-context';
import {
  districtFormSchema,
  type DistrictFormValues,
} from '@/schemas/districtSchema';
import type { DistrictResponse } from '@/types/district';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface DistrictFormProps {
  district: DistrictResponse;
  onSave: (data: DistrictFormValues) => void;
  onCancel: () => void;
}

export function DistrictForm({
  district,
  onSave,
  onCancel,
}: DistrictFormProps) {
  const { toast } = useToast();

  // Set up form with default values from district data
  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      name: district?.name || undefined,
      location: district.location || undefined,
      directorName: district?.director_name || undefined,

      // Address fields (flattened)
      streetAddress1: district?.address?.street_address_1 || undefined,
      streetAddress2: district?.address?.street_address_2 || undefined,
      city: district?.address?.city || undefined,
      state: district?.address?.state || undefined,
      zipCode: district?.address?.zip_code || undefined,

      // Contact Information
      phone: district?.phone || undefined,
      email: district?.email || undefined,
      fax: district?.fax || undefined,
      website: district?.website || undefined,

      // District Details
      districtEnrollment: district?.district_enrollment || 0,
      raNumber: district?.ra_number || undefined,
      numberOfSchools: district?.schools?.length || 0,
      numberOfStudents:
        district?.schools?.reduce(
          (total, school) => total + (school.enrollment || 0),
          0
        ) || 0,
      annualBudget: district?.annual_budget
        ? Number.parseFloat(district.annual_budget.toString())
        : 0,

      // Secondary Contact
      secondaryContactName: district?.secondary_contact_name || undefined,
      secondaryContactPhone: district?.secondary_contact_phone || undefined,
      secondaryContactEmail: district?.secondary_contact_email || undefined,

      // Additional Information
      superintendentName: district?.superintendent_name || undefined,
      establishedYear: district?.established_year || undefined,

      // Billing Information (flattened)
      billingContactName: district?.billing_contact_name || undefined,
      billingContactStreetAddress1:
        district?.billing_address?.street_address_1 || undefined,
      billingContactStreetAddress2:
        district?.billing_address?.street_address_2 || undefined,
      billingContactCity: district?.billing_address?.city || undefined,
      billingContactState: district?.billing_address?.state || undefined,
      billingContactZipCode: district?.billing_address?.zip_code || undefined,
      billingContactPhone: district?.billing_contact_phone || undefined,
      billingContactEmail: district?.billing_contact_email || undefined,

      // Products/Categories
      products: district?.products || [],

      // Delete flag
      isDelete: false,
    },
  });

  const handleSubmit = (data: DistrictFormValues) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-3">Primary Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City, State" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="directorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Director Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="districtEnrollment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District Enrollment</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="raNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RA Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfSchools"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Schools</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Students</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Budget</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="superintendentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superintendent Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="establishedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Fields */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Address
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="streetAddress1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street address, P.O. box"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="streetAddress2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input maxLength={2} placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Secondary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="secondaryContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryContactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="billingContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Contact Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingContactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Billing Address
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="billingContactStreetAddress1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street address, P.O. box"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingContactStreetAddress2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="billingContactCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingContactState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input maxLength={2} placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingContactZipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
