import { redirect } from 'next/navigation';

export default async function SendEmailPage() {
  redirect('/communications/test?tab=email');
}
