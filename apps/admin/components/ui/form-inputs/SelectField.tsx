import { SelectProps } from '@radix-ui/react-select';
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
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { Option } from '@/lib/models/logs-viewer';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface SelectFieldProps extends SelectProps {
  label: string;
  fieldName?: string;
  description?: string;
  placeholder?: string;
  options: string[] | Option[];
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
  placeholder = 'Select one option',
  options,
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
  const SelectInput = () => (
    <div className={className}>
      <Label className={labelClassName}>{label}</Label>
      <Select {...restProps}>
        <SelectTrigger className={selectTriggerClassName}>
          <SelectValue
            placeholder={placeholder}
            className={selectValueClassName}
          />
        </SelectTrigger>
        <SelectContent className={cn('bg-background', selectContentClassName)}>
          {options.map((option: Option | string) => (
            <SelectItem
              key={typeof option === 'string' ? option : option.value}
              value={typeof option === 'string' ? option : option.value}
              className={selectItemClassName}
            >
              {typeof option === 'string' ? option : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <span className={descriptionClassName}>{description}</span>
      )}
    </div>
  );

  const SelectInputWithForm = () => {
    const { control } = useFormContext();

    if (!fieldName) {
      return null;
    }

    return (
      <FormField
        name={fieldName}
        control={control}
        render={({ field }: { field: ControllerRenderProps<any> }) => (
          <FormItem className={className}>
            <FormLabel className={labelClassName}>{label}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
              {...restProps}
            >
              <FormControl>
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue
                    placeholder={placeholder}
                    className={selectValueClassName}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                className={cn('bg-background', selectContentClassName)}
              >
                {options.map((option: Option | string) => (
                  <SelectItem
                    key={typeof option === 'string' ? option : option.value}
                    value={typeof option === 'string' ? option : option.value}
                    className={selectItemClassName}
                  >
                    {typeof option === 'string' ? option : option.label}
                  </SelectItem>
                ))}
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

  return fieldName ? <SelectInputWithForm /> : <SelectInput />;
};

export default SelectField;
