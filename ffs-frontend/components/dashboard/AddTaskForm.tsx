'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormTextInput } from '../Form/FormTextInput';
import { FormSelectInput } from '../Form/FormSelectInput';
import { FormDatePicker } from '../Form/FormDateInput';
import { useApiQuery, usePostMutation } from '@/hooks/use-api';
import { Task } from '@/types/task';
import { AxiosError } from 'axios';
import { ListUsersResponseItem, Meta, User } from '@/types/auth';
import { toast } from 'sonner';
import dayjs from 'dayjs';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  due_date: z.coerce.date({
    required_error: 'Due date is required',
    invalid_type_error: 'Due date must be a valid date',
  }),
  assigned_to: z.coerce
    .number({ invalid_type_error: 'Assigned to is required' })
    .int({ message: 'assigned_to must be an integer' }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

type AddTaskFormProps = {
  onSuccess: () => void;
  triggerLabel?: string;
};

export function AddTaskForm({ onSuccess }: AddTaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      due_date: undefined,
      assigned_to: undefined,
    },
  });

  const { data: users, isLoading } = useApiQuery<ListUsersResponseItem[]>(
    '/users',
    ['users']
  );

  const { mutate, isPending } = usePostMutation<Omit<Task, 'id'>, Task>(
    '/tasks',
    {
      onSuccess: () => {
        toast.success('You have created the task successfully!');
        onSuccess();
        form.reset();
      },
      onError: (error: AxiosError<Meta>) => {
        toast.error(error?.response?.data?.error || 'Failed to create task');
      },
    }
  );

  const handleSubmit = (data: TaskFormValues) => {
    mutate({ ...data, due_date: dayjs(data.due_date).format('YYYY-MM-DD') });
  };

  const usersOptions = users?.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col space-y-4"
      >
        <FormTextInput
          control={form.control}
          name="title"
          label="Title"
          placeholder="Enter task title"
        />

        <FormDatePicker
          control={form.control}
          name="due_date"
          label="Due Date"
        />

        <FormSelectInput
          control={form.control}
          name="assigned_to"
          label="Assigned To"
          options={usersOptions || []}
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
