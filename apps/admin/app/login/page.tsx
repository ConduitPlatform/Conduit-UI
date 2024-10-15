import { Metadata } from 'next';
import { LoginForm } from '@/components/login/loginForm';
import Image from 'next/image';
import { LoginIllustration } from '@/icons';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
};

export default function AuthenticationPage() {
  return (
    <div className="grid h-full grid-cols lg:grid-cols-2">
      <div className="items-center hidden h-full text-white dark:border-r lg:flex bg-primary dark:bg-primary-foreground">
        <LoginIllustration />
      </div>
      <div className="flex items-center justify-center lg:p-8">
        <div className="space-y-6 w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Image
              src={'conduitLogo.svg'}
              alt={'Conduit Logo'}
              className={'mx-auto'}
              width={300}
              height={56}
            />
            <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Enter your username/password to login to your account.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
