import { redirect } from 'next/navigation';

export default async function Page() {
  redirect('/communications/settings?tab=push');
}
