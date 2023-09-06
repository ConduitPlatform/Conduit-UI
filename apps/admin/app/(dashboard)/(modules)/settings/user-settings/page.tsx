import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Check, KeyRound, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NewPasswordSheet } from '@/components/settings/user-settings/NewPasswordSheet';
import { TwoFASheet } from '@/components/settings/user-settings/2FASheet';
import { Checkbox } from '@/components/ui/checkbox';

export default function SettingsUser() {
  const data = {name:'lydia', createdAt:'19/06/21',superAdmin:true}
  return (
    <div className={'container flex mx-auto py-16 main-scrollbar items-center justify-center'}>
      <Card className={'w-fit'}>
        <CardHeader>
          <p className={'text-2xl font-medium'}>User Information</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className={'flex gap-2'}>
            <div className={'flex flex-col space-y-2 w-1/2'}>
              <Label>Username</Label>
              <Input
                disabled={true}
                value={data.name}
                title={'userName'}
                className={'text-accent-foreground'}
              />
            </div>
            <div className={'flex flex-col space-y-2 w-1/2'}>
              <Label>Created At</Label>
              <Input
                disabled={true}
                value={data.createdAt}
                className={'text-accent-foreground'}
              />
            </div>
          </div>
          <div className={'flex space-x-2 items-center'}>
            <Label>Super admin</Label>
            {data.superAdmin ? <Check width={15} color={'green'}/> : <X width={15} color={'red'} />}
          </div>
          <NewPasswordSheet>
            <Button className="flex gap-2 w-6/12">
              <KeyRound />
              Change Password
            </Button>
          </NewPasswordSheet>
          <div className=" flex items-center space-x-4 rounded-md border p-4">
            <ShieldCheck />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                2FA
              </p>
              <p className="text-sm text-muted-foreground w-11/12">
                Enable 2 Factor Authentication for secure Login
              </p>
            </div>
            <TwoFASheet/>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}