import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import * as React from 'react';
import SwitchField from '@/components/ui/form-inputs/SwitchField';

export const ModelSettings = ({ form }: { form: any }) => {
  const [crudOperations, setCrudOperations] = React.useState({
    create: { enabled: false, requiresAuth: false },
    read: { enabled: false, requiresAuth: false },
    update: { enabled: false, requiresAuth: false },
    delete: { enabled: false, requiresAuth: false },
  });
  const [authorizationEnabled, setAuthorizationEnabled] = React.useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CRUD Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(crudOperations).map(([operation]) => (
              <div
                key={operation}
                className="flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={`${operation}-enabled`}>
                    {operation.charAt(0).toUpperCase() + operation.slice(1)}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable {operation} operation
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <SwitchField
                    id={`${operation}-enabled`}
                    fieldName={`crudOperations.${operation}.enabled`}
                  />
                  {form.watch(`crudOperations.${operation}.enabled`) && (
                    <div className="flex items-center space-x-2">
                      <SwitchField
                        id={`${operation}-auth`}
                        fieldName={`crudOperations.${operation}.requiresAuth`}
                      />
                      <Label htmlFor={`${operation}-auth`}>Requires Auth</Label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Authorization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="authorization-enabled"
                checked={authorizationEnabled}
                onCheckedChange={checked => {
                  setAuthorizationEnabled(checked);
                  form.setValue('authorizationEnabled', checked);
                }}
              />
              <Label htmlFor="authorization-enabled">
                Enable Authorization
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
