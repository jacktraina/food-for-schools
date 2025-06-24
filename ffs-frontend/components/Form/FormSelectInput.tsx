import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

type Option = { label: string; value: string | number };

type FormSelectInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export function FormSelectInput<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  disabled = false,
}: FormSelectInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="w-full" key={String(field.value)}>
            {label && (
              <FormLabel className="text-sm font-light">{label}</FormLabel>
            )}
            <Select
              onValueChange={(val) => {
                const selected = options.find(
                  (opt) => String(opt.value) === val
                );
                field.onChange(selected?.value ?? val);
              }}
              value={field.value !== undefined ? String(field.value) : ''}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="bg-white w-full h-10">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.length > 0 ? (
                  options.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled key={'no-options'} value={'no-options'}>
                    No options available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
