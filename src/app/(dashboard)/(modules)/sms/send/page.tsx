import { redirect } from 'next/navigation';

export default async function SendSmsPage() {
  redirect('/communications/test?tab=sms');
}
