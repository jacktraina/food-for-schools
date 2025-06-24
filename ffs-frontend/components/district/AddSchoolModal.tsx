'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  schoolFormSchemaWithConditionals,
  type SchoolFormValues,
  transformToApiRequest,
  CreateSchoolPayload,
} from '@/schemas/schoolSchema';

interface AddSchoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (newSchool: CreateSchoolPayload) => void;
  isLoading?: boolean;
  districtBillingInfo?: {
    billingContact: string;
    billingAddress: string;
    billingPhone: string;
    billingEmail: string;
  };
}

const steps = [
  {
    id: 'basic',
    title: 'Basic Information',
    subtitle: 'Enter general school information',
  },
  {
    id: 'contact',
    title: 'School Contact',
    subtitle: 'Enter primary contact details',
  },
  {
    id: 'address',
    title: 'School Address',
    subtitle: 'Enter the physical address',
  },
  {
    id: 'shipping',
    title: 'Shipping Information',
    subtitle: 'Enter delivery address details',
  },
  {
    id: 'billing',
    title: 'Billing Information',
    subtitle: 'Enter payment and billing details',
  },
];

export function AddSchoolModal({
  open,
  onOpenChange,
  onAdd,
  isLoading = false,
  districtBillingInfo,
}: AddSchoolModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Set up form with React Hook Form and Zod
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchemaWithConditionals),
    defaultValues: {
      name: '',
      schoolType: undefined,
      enrollment: undefined,
      phone: '',
      fax: '',
      email: '',
      website: '',
      notes: '',

      // Contact fields
      contactFirstName: '',
      contactLastName: '',
      contactTitle: '',
      contactPhone: '',
      contactEmail: '',

      // Address fields (flattened)
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',

      // Shipping fields
      useSchoolAddressForShipping: false,
      shippingAddressLine1: '',
      shippingAddressLine2: '',
      shippingAddressCity: '',
      shippingAddressState: '',
      shippingAddressZipCode: '',

      // Billing fields
      overrideDistrictBilling: false,
      billingContact: '',
      billingPhone: '',
      billingEmail: '',
      billingAddressLine1: '',
      billingAddressLine2: '',
      billingCity: '',
      billingState: '',
      billingZipCode: '',
    },
  });

  // Watch form values for conditional logic
  const useSchoolAddressForShipping = form.watch('useSchoolAddressForShipping');
  const overrideDistrictBilling = form.watch('overrideDistrictBilling');

  const getFieldsForStep = (step: number): (keyof SchoolFormValues)[] => {
    switch (step) {
      case 0:
        return ['name', 'schoolType', 'phone', 'email'];
      case 1:
        return [
          'contactFirstName',
          'contactLastName',
          'contactPhone',
          'contactEmail',
        ];
      case 2:
        return ['addressLine1', 'city', 'state', 'zipCode'];
      case 3:
        if (!useSchoolAddressForShipping) {
          return [
            'shippingAddressLine1',
            'shippingAddressCity',
            'shippingAddressState',
            'shippingAddressZipCode',
          ];
        }
        return [];
      case 4:
        if (overrideDistrictBilling) {
          return ['billingContact', 'billingEmail', 'billingAddressLine1'];
        }
        return [];
      default:
        return [];
    }
  };

  // Effect to copy school address to shipping address when checkbox is checked
  useEffect(() => {
    if (useSchoolAddressForShipping) {
      form.setValue('shippingAddressLine1', form.getValues('addressLine1'));
      form.setValue('shippingAddressLine2', form.getValues('addressLine2'));
      form.setValue('shippingAddressCity', form.getValues('city'));
      form.setValue('shippingAddressState', form.getValues('state'));
      form.setValue('shippingAddressZipCode', form.getValues('zipCode'));
    }
  }, [useSchoolAddressForShipping, form]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);

    let isValid = true;
    if (fieldsToValidate.length > 0) {
      isValid = await form.trigger(fieldsToValidate as any);
    }

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === steps.length - 1) {
      const finalValidation = await form.trigger();
      if (finalValidation) {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => {
      const newSchool = transformToApiRequest(data);
      onAdd(newSchool);

      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
    })();
  };

  const handleCancel = () => {
    form.reset();
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="mb-0 pb-0">
          <DialogTitle className="text-xl">Add New School</DialogTitle>
          <DialogDescription className="mb-4">
            Enter the information for the new school.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/40'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-4">
            {/* Step Title and Subtitle */}
            <div className="mb-5 pb-3 border-b">
              <h2 className="text-lg font-semibold">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Basic Information Step */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schoolType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                            <SelectItem value="Childcare">Childcare</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enrollment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Number of students"
                            {...field}
                          />
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
                          <Input
                            placeholder="www.schoolwebsite.edu"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
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
                          <Input placeholder="(555) 123-4568" {...field} />
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
                          <Input
                            type="email"
                            placeholder="school@district.edu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this school"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* School Contact Step */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title/Position</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Principal, Food Service Director"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@school.edu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* School Address Step */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Apartment, suite, unit, etc. (optional)"
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
                          <Input placeholder="City" {...field} />
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
                            placeholder="State (e.g., CA)"
                            maxLength={2}
                            {...field}
                          />
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
                          <Input placeholder="ZIP Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Shipping Information Step */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="useSchoolAddressForShipping"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="my-0">
                          Use same as school address
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {!useSchoolAddressForShipping && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingAddressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingAddressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Address Line 2</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apartment, suite, unit, etc. (optional)"
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
                        name="shippingAddressCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingAddressState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State (e.g., CA)"
                                maxLength={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shippingAddressZipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Billing Information Step */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="overrideDistrictBilling"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Override District Billing Information
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  {!overrideDistrictBilling ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>District Billing Contact</FormLabel>
                        <Input
                          value={districtBillingInfo?.billingContact}
                          disabled
                        />
                      </div>
                      <div>
                        <FormLabel>District Billing Phone</FormLabel>
                        <Input
                          value={districtBillingInfo?.billingPhone}
                          disabled
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FormLabel>District Billing Address</FormLabel>
                        <Input
                          value={districtBillingInfo?.billingAddress}
                          disabled
                        />
                      </div>
                      <div>
                        <FormLabel>District Billing Email</FormLabel>
                        <Input
                          value={districtBillingInfo?.billingEmail}
                          disabled
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billingContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Contact</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Name of billing contact"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Phone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(555) 123-4567"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="billingAddressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Address Line 1</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Street address"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingAddressLine2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Address Line 2</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Apartment, suite, unit, etc. (optional)"
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
                          name="billingCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="State (e.g., CA)"
                                  maxLength={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="billingZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="ZIP Code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="billingEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="billing@school.edu"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Custom footer with properly positioned buttons */}
            <div className="flex items-center justify-between w-full border-t pt-4 mt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    Add School
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
