import { EmailSettings } from '@/lib/models/Email';

interface Props{
  control: any;
  edit: boolean;
  setEdit: (arg0:boolean)=> void;
  data: EmailSettings;
  watch: any;
  reset: any;
}
export const SettingsForm = ({control, edit, setEdit, watch, reset, data}:Props) => {
  return(<></>);
}