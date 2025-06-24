import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

type FormCheckboxInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  className?: string;
} & React.ComponentProps<typeof Checkbox>;

export function FormCheckboxInput<T extends FieldValues>({
  control,
  name,
  label,

  className,
  ...props
}: FormCheckboxInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-start space-x-1 space-y-0">
          <FormControl>
            <Checkbox
              {...props}
              className={className}
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                props.onCheckedChange?.(checked);
              }}
              ref={field.ref}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel className="text-xs font-light">{label}</FormLabel>
            )}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
