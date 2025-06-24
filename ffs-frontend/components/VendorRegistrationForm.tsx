'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormTextInput } from './Form/FormTextInput';
import { FormSelectInput } from './Form/FormSelectInput';
import { useApiQuery, usePostMutation } from '@/hooks/use-api';
import { toast } from 'sonner';
import { useState } from 'react';
import { VendorRegistrationData, Organization } from '@/lib/api/vendors';

const vendorRegistrationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  organizationId: z.coerce.number().int().positive('Please select an organization'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VendorRegistrationFormInput = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationId: number;
};

type VendorRegistrationFormValues = z.infer<typeof vendorRegistrationSchema>;

interface VendorRegistrationFormProps {
  onSuccess: () => void;
}

export function VendorRegistrationForm({ onSuccess }: VendorRegistrationFormProps) {
  
  const form = useForm<VendorRegistrationFormInput>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organizationId: 0,
    },
  });

  const { data: organizationsResponse, isLoading: organizationsLoading } = useApiQuery<{ organizations: Organization[] }>(
    '/vendors/organizations',
    ['vendor-organizations']
  );

  const organizations = organizationsResponse?.organizations || [];

  const { mutate: submitRegistration, isPending } = usePostMutation<VendorRegistrationData, any>(
    '/vendors/register',
    {
      onSuccess: () => {
        toast.success('Vendor registration successful! Awaiting organization approval.');
        onSuccess();
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.error || 'Failed to register vendor');
      },
    }
  );

  const handleSubmit = (data: VendorRegistrationFormInput) => {
    const selectedOrg = organizations.find(org => org.id === data.organizationId);
    if (!selectedOrg) {
      toast.error('Please select an organization');
      return;
    }

    const registrationData: VendorRegistrationData = {
      companyName: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      organizationId: selectedOrg.id,
      organizationType: selectedOrg.type,
    };

    submitRegistration(registrationData);
  };

  const organizationOptions = organizations.map((org) => ({
    label: `${org.name} (${org.type === 'cooperative' ? 'Cooperative' : 'District'})`,
    value: org.id,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormTextInput
          control={form.control}
          name="companyName"
          label="Company Name"
          placeholder="Enter company name"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormTextInput
            control={form.control}
            name="firstName"
            label="First Name"
            placeholder="Enter first name"
          />
          <FormTextInput
            control={form.control}
            name="lastName"
            label="Last Name"
            placeholder="Enter last name"
          />
        </div>

        <FormTextInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="Enter email address"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormTextInput
            control={form.control}
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password"
          />
          <FormTextInput
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
          />
        </div>

        <FormSelectInput
          control={form.control}
          name="organizationId"
          label="Organization"
          options={organizationOptions}
          placeholder="Select an organization"
          disabled={organizationsLoading}
        />

        <Button type="submit" className="w-full" disabled={isPending || organizationsLoading}>
          {isPending ? 'Registering...' : 'Register as Vendor'}
        </Button>
      </form>
    </Form>
  );
}
