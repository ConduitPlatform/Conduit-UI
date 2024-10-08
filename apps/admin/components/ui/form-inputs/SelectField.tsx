import { SelectProps } from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';

interface SelectFieldProps extends SelectProps {
  label: string;
  fieldName: string;
  description?: string;
  placeholder?: string;
  options:
    | string[]
    | {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
      }[];
  className?: string;
  classNames?: {
    selectItem?: string;
    selectValue?: string;
    selectContent?: string;
    selectTrigger?: string;
    label?: string;
    error?: string;
    description?: string;
  };
}
const SelectField = ({
  fieldName,
  label,
  description,
  className,
  placeholder,
  options,
  disabled,
  classNames: {
    selectTrigger: selectTriggerClassName,
    selectValue: selectValueClassName,
    selectContent: selectContentClassName,
    selectItem: selectItemClassName,
    label: labelClassName,
    error: errorClassName,
    description: descriptionClassName,
  } = {},
  ...restProps
}: SelectFieldProps) => {
  const { control } = useFormContext();
  return (
    <FormField
      name={fieldName}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClassName}>{label}</FormLabel>
          <Select
            value={field.value}
            defaultValue={field.value}
            onValueChange={field.onChange}
            {...restProps}
          >
            <FormControl>
              <SelectTrigger className={cn(selectTriggerClassName)}>
                <SelectValue
                  placeholder={placeholder}
                  className={selectValueClassName}
                />
              </SelectTrigger>
            </FormControl>

            <SelectContent className={selectContentClassName}>
              {options.map(option => {
                return (
                  <SelectItem
                    key={typeof option === 'string' ? option : option.value}
                    value={typeof option === 'string' ? option : option.value}
                    className={selectItemClassName}
                  >
                    {typeof option === 'string' ? option : option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {description && (
            <FormDescription className={descriptionClassName}>
              {description}
            </FormDescription>
          )}
          <FormMessage className={errorClassName} />
        </FormItem>
      )}
    />
  );
};
export default SelectField;
