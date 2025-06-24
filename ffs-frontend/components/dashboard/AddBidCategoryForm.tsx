'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormTextInput } from '../Form/FormTextInput';
import { usePostMutation } from '@/hooks/use-api';
import { BidCategory } from '@/types/bid-category';
import { AxiosError } from 'axios';
import { Meta } from '@/types/auth';
import { toast } from 'sonner';

const bidCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type BidCategoryFormValues = z.infer<typeof bidCategorySchema>;

type AddBidCategoryFormProps = {
  onSuccess: () => void;
};

export function AddBidCategoryForm({ onSuccess }: AddBidCategoryFormProps) {
  const form = useForm<BidCategoryFormValues>({
    resolver: zodResolver(bidCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { mutate, isPending } = usePostMutation<Omit<BidCategory, 'id' | 'external_id'>, BidCategory>(
    '/bid-categories',
    {
      onSuccess: () => {
        toast.success('You have created the category successfully!');
        onSuccess();
        form.reset();
      },
      onError: (error: AxiosError<Meta>) => {
        toast.error(error?.response?.data?.error || 'Failed to create category');
      },
    }
  );

  const handleSubmit = (data: BidCategoryFormValues) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col space-y-4"
      >
        <FormTextInput
          control={form.control}
          name="name"
          label="Category Name"
          placeholder="Enter category name"
        />

        <FormTextInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter category description (optional)"
        />

        <div className="ml-auto">
          <Button disabled={isPending} type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
