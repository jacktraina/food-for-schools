import { Control, FieldValues, Path } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

type OTPFormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  length?: number;
};

export function OTPFormField<T extends FieldValues>({
  name,
  control,
  length = 6,
}: OTPFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <InputOTP maxLength={length} {...field}>
              <InputOTPGroup className="flex justify-center space-x-2">
                {Array.from({ length }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
