import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NotificationSettings } from '@/lib/models/Notification';

interface Props{
  control: any;
  edit: boolean;
  setEdit: (arg0:boolean)=> void;
  handleFileChange: (arg0:any)=> void;
  data: NotificationSettings;
  watch: any;
  reset: any;
}
export const SettingsForm = ({control, edit, setEdit, watch, reset, handleFileChange, data}:Props) => {
  return(
    <>
      <div className={'flex flex-col gap-4'}>
        <FormField
          control={control}
          name='providerName'
          render={({ field }) => (
            <FormItem className={'w-5/12'} >
              <FormLabel>Provider</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!edit}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a provider' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className={'bg-white dark:bg-popover'}>
                  <SelectItem value={'basic'}>Basic</SelectItem>
                  <SelectItem value={'firebase'}>
                    <div className={'flex items-center gap-2'}>
                      Firebase {data.firebase && data.firebase.projectId!== '' && watch('providerName') !== 'firebase' && <Cog />}
                    </div>
                  </SelectItem>
                  <SelectItem value={'oneSignal'}>
                    <div className={'flex items-center gap-2'}>
                      OneSignal {data.onesignal && data.onesignal.appId && watch('providerName') !== 'oneSignal' && <Cog />}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watch('providerName') === 'oneSignal' &&
          <div className={'grid grid-cols-2 gap-4'}>
            <FormField
              control={control}
              name='appId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    App ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      title={'App Id'}
                      placeholder={'Enter a value'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='apiKey'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    API Key
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!edit}
                      title={'api key'}
                      placeholder={'Enter a value'}
                      className={'text-accent-foreground'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        }
        {watch('providerName') === 'firebase' &&
          <>
            <div className={'grid grid-cols-2 gap-4'}>
              <FormField
                control={control}
                name='projectId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'Project Id'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='clientEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Client Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'client email'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='privateKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Private Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!edit}
                        title={'private key'}
                        placeholder={'Enter a value'}
                        className={'text-accent-foreground'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Card className={'flex flex-col  w-fit'}>
              <CardContent className={'flex  justify-center items-center gap-6 py-6'}>
                <p className={'font-semibold'}>Or</p>
                <div className={'flex flex-col space-y-2'}>
                  <p className={'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'}>
                    Upload JSON File
                  </p>
                  <Input
                    disabled={!edit}
                    type={'file'}
                    accept={'.json'}
                    title={'file upload'}
                    className={'text-accent-foreground'}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        }
      </div>
      <div className={'py-4 flex justify-end'}>
        {edit ?
          <div className={'flex gap-2'}>
            <Button
              type='button'
              className={'dark:border-gray-500'}
              variant={'outline'}
              onClick={()=> {
                reset();
                setEdit(false);
              }}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </div>:
          <Button onClick={()=>{setEdit(true)}} >Edit</Button>
        }
      </div>
    </>
  )
}