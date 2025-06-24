'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Upload } from 'lucide-react';
import type { CreateDistrictPayload } from '@/types/district';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  createDistrictSchema,
  type CreateDistrictFormValues,
} from '@/schemas/districtSchema';

interface CreateDistrictFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (district: any) => void;
  isLoading?: boolean;
  onBulkUpload: () => void;
}

const steps = [
  { id: 'primary', label: 'Primary Info' },
  { id: 'secondary', label: 'Secondary Contact' },
  { id: 'billing', label: 'Billing Info' },
  { id: 'products', label: 'Products' },
];

export function CreateDistrictForm({
  open,
  onOpenChange,
  onAdd,
  isLoading = false,
  onBulkUpload,
}: CreateDistrictFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [newProduct, setNewProduct] = useState('');

  const form = useForm<CreateDistrictFormValues>({
    resolver: zodResolver(createDistrictSchema),
    defaultValues: {
      name: undefined,
      location: undefined,
      directorName: undefined,
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
      phone: undefined,
      email: undefined,
      fax: undefined,
      website: undefined,
      enrollment: undefined,
      raNumber: undefined,
      schools: undefined,
      students: undefined,
      budget: undefined,
      contact2: undefined,
      contact2Phone: undefined,
      contact2Email: undefined,
      superintendent: undefined,
      established: undefined,
      billingContact: undefined,
      billingAddressLine1: undefined,
      billingAddressLine2: undefined,
      billingCity: undefined,
      billingState: undefined,
      billingZipCode: undefined,
      billingPhone: undefined,
      billingEmail: undefined,
      participatingIn: [],
      products: [],
      status: 'Active',
    },
  });

  // Get the current products array from form state
  const participatingIn = form.watch('participatingIn') || [];

  // Get fields to validate for each step
  const getFieldsForStep = (
    step: number
  ): (keyof CreateDistrictFormValues)[] => {
    switch (step) {
      case 0:
        return ['name', 'email', 'website'];
      case 1:
        return ['contact2Email'];
      case 2:
        return ['billingEmail'];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const handleAddProduct = () => {
    if (newProduct.trim() && !participatingIn.includes(newProduct.trim())) {
      const updatedProducts = [...participatingIn, newProduct.trim()];
      form.setValue('participatingIn', updatedProducts);
      form.setValue('products', updatedProducts);
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (product: string) => {
    const updatedProducts = participatingIn.filter((p) => p !== product);
    form.setValue('participatingIn', updatedProducts);
    form.setValue('products', updatedProducts);
  };

  const handleNext = async () => {
    // Get fields to validate for current step
    const fieldsToValidate = getFieldsForStep(currentStep);

    // Validate current step fields before proceeding
    let isValid = true;
    if (fieldsToValidate.length > 0) {
      isValid = await form.trigger(fieldsToValidate as any);
    }

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === steps.length - 1) {
      // On final step, validate entire form before submission
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

  const handleTabChange = (value: string) => {
    const tabIndex = steps.findIndex((step) => step.id === value);

    if (tabIndex <= currentStep) {
      setCurrentStep(tabIndex);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => {
      const products = data.participatingIn || [];

      const districtData: CreateDistrictPayload = {
        ...data,
        products,
      };

      onAdd(districtData);
    })();
  };

  const handleCancel = () => {
    form.reset();
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New District</DialogTitle>
          <DialogDescription>
            Enter the information for the new district.
          </DialogDescription>
          <div className="mt-2 text-sm">
            <button
              onClick={(e) => {
                e.preventDefault();
                onBulkUpload();
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Bulk upload multiple districts using CSV
            </button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs
              value={steps[currentStep].id}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 gap-2 mb-4">
                {steps.map((step, index) => (
                  <TabsTrigger
                    key={step.id}
                    className={`px-4 ${
                      index > currentStep ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    value={step.id}
                    disabled={index > currentStep}
                  >
                    {step.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="primary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          District Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter district name" {...field} />
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
                          <Input placeholder="City, State" {...field} />
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
                          <Input
                            placeholder="Full name of director"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Street address, P.O. box, etc."
                            {...field}
                          />
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
                        <FormLabel>Street Address 2</FormLabel>
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
                          <Input placeholder="State (e.g. CA, NY)" {...field} />
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

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(___) ___-____" {...field} />
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
                            placeholder="email@example.com"
                            {...field}
                          />
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
                          <Input placeholder="(___) ___-____" {...field} />
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
                            placeholder="https://www.example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enrollment"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>District Enrollment</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Total number of students enrolled"
                            value={value === undefined ? '' : value}
                            onChange={(e) => {
                              const val = e.target.value;
                              onChange(val === '' ? undefined : Number(val));
                            }}
                            {...field}
                          />
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
                          <Input
                            placeholder="Registration/Authorization Number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schools"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Number of Schools</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Total number of schools"
                            value={value === undefined ? '' : value}
                            onChange={(e) => {
                              const val = e.target.value;
                              onChange(val === '' ? undefined : Number(val));
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="students"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Number of Students</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Total number of students"
                            value={value === undefined ? '' : value}
                            onChange={(e) => {
                              const val = e.target.value;
                              onChange(val === '' ? undefined : Number(val));
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Budget</FormLabel>
                        <FormControl>
                          <Input placeholder="$0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="secondary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full name of secondary contact"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact2Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(___) ___-____" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact2Email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="superintendent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superintendent</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full name of superintendent"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="established"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Established Year</FormLabel>
                        <FormControl>
                          <Input placeholder="YYYY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full name of billing contact"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingAddressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address 1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Street address, P.O. box, etc."
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
                        <FormLabel>Street Address 2</FormLabel>
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
                          <Input placeholder="State (e.g. CA, NY)" {...field} />
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

                  <FormField
                    control={form.control}
                    name="billingPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(___) ___-____" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new product"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddProduct();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddProduct}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {participatingIn.map((product, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                      >
                        {product}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-blue-700 hover:bg-blue-100 rounded-full"
                          onClick={() => handleRemoveProduct(product)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {product}</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
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
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add District'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
