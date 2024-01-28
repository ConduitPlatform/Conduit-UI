import { Metadata } from 'next';
import { LoginForm } from '@/components/login/loginForm';
import { adminLogin } from '@/lib/api';
import LoginIllustration from '@/components/login/loginSvg';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
};

export default function AuthenticationPage() {
  return (
    <>
      <div
        className='container hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
        <div className='hidden h-full text-white dark:border-r lg:flex bg-primary dark:bg-primary-foreground items-center'>
          <LoginIllustration />
        </div>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <Image src={'conduitLogo.svg'} alt={'Conduit Logo'} className={"mx-auto"} width={300} height={56} />
              <h1 className='text-2xl font-semibold tracking-tight'>
                Sign In
              </h1>
              <p className='text-sm text-muted-foreground'>
                Enter your username/password to login to your account.
              </p>
            </div>
            <LoginForm loginAction={adminLogin} />
          </div>
        </div>
      </div>
    </>
  );
}
