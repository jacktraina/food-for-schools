import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import * as React from 'react';
import { cn } from '@/lib/utils';

type FormTextAreaInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormTextAreaInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  rows = 4,
  ...props
}: FormTextAreaInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {label && (
            <FormLabel className="text-sm font-light">{label}</FormLabel>
          )}
          <FormControl>
            <textarea
              {...props}
              {...field}
              rows={rows}
              placeholder={placeholder}
              className={cn(
                'w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-black focus:outline-none',
                className
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
