import { Metadata } from 'next';
import { LoginForm } from '@/components/login/loginForm';
import { loginAction } from '@/lib/api';
import LoginIllustration from '@/components/login/loginSvg';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
};

export default function AuthenticationPage() {
  return (
    <>
      <div
        className='container hidden h-max flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
        <div className='hidden h-full bg-muted text-white dark:border-r lg:block'>
          <LoginIllustration className={'bg-primary'} height='100vh'/>
        </div>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Sign In
              </h1>
              <p className='text-sm text-muted-foreground'>
                Enter your email/password to login to your account.
              </p>
            </div>
            <LoginForm loginAction={loginAction} />
          </div>
        </div>
      </div>
    </>
  );
}
