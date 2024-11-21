import { LucideMail } from 'lucide-react';
import { getTemplates } from '@/lib/api/email';
import { SendEmailForm } from '@/components/email/send/form';

export default async function SendEmailPage() {
  const templates = await getTemplates({});

  return (
    <div className="flex flex-col space-y-6 container py-10">
      <div className="flex space-x-2 items-center">
        <LucideMail className="w-5 h-5" />
        <span>Compose Email</span>
      </div>
      <SendEmailForm templates={templates} />
    </div>
  );
}
