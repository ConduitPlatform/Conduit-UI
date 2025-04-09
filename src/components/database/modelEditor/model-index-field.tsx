import { Card, CardContent } from '@/components/ui/card';
import { indexTypes } from './constants';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import SelectField from '@/components/ui/form-inputs/SelectField';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';

export const ModelIndexField = ({
  index,
  idx,
  form,
  removeIndex,
}: {
  index: any;
  idx: number;
  form: any;
  removeIndex: (index: number) => void;
}) => {
  const indexPath = `indices.${idx}`;

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <InputField
              label={''}
              fieldName={`${indexPath}.name`}
              placeholder={'Index name'}
            />
            <SelectField
              label={''}
              fieldName={`${indexPath}.type`}
              placeholder={'Type'}
              options={indexTypes.map(type => ({ label: type, value: type }))}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeIndex(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <InputField
              label={'Fields (comma-separated)'}
              fieldName={`${indexPath}.fields`}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <SwitchField fieldName={`${indexPath}.unique`} label={'Unique'} />
            </div>
            <div className="flex items-center space-x-2">
              <SwitchField fieldName={`${indexPath}.sparse`} label={'Sparse'} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
