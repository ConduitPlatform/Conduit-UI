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
import { Fragment } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SelectFieldProps extends SelectProps {
  label: string;
  fieldName?: string;
  description?: string;
  placeholder?: string;
  options: Option[];
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
  const DescriptionElement = fieldName ? FormDescription : 'span';
  const LabelElement = fieldName ? FormLabel : Label;
  const ItemWrapper = fieldName ? FormItem : 'div';
  const InputWrapper = fieldName ? FormControl : Fragment;

  const renderSelectInput = (field?: ControllerRenderProps<any>) => (
    <ItemWrapper className={className}>
      <LabelElement className={labelClassName}>{label}</LabelElement>
      <Select
        {...(field && { onValueChange: field.onChange })}
        {...(field && { value: field.value })}
        {...(field && { defaultValue: field.value })}
        {...restProps}
      >
        <InputWrapper>
          <SelectTrigger className={selectTriggerClassName}>
            <SelectValue
              placeholder={placeholder}
              className={selectValueClassName}
            />
          </SelectTrigger>
        </InputWrapper>
        <SelectContent className={cn('bg-background', selectContentClassName)}>
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
        <DescriptionElement className={descriptionClassName}>
          {description}
        </DescriptionElement>
      )}
      {field && <FormMessage className={errorClassName} />}
    </ItemWrapper>
  );

  if (fieldName) {
    const { control } = useFormContext();

    return (
      <FormField
        name={fieldName}
        control={control}
        render={({ field }) => renderSelectInput(field)}
      />
    );
  }
  return renderSelectInput();
};
export default SelectField;
