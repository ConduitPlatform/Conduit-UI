import { Metadata } from 'next';
import { LoginForm } from '@/components/login/loginForm';
import Image from 'next/image';
import { LoginIllustration } from '@/icons';
import { _getEnvs } from '@/lib/logic/EnvManager';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
};
export const dynamic = 'force-dynamic';
export default async function AuthenticationPage({
  searchParams,
}: {
  searchParams: Promise<{ env?: string }>;
}) {
  const { env } = await searchParams;
  const envs = await _getEnvs();

  return (
    <div className="grid h-full grid-cols bg-background text-foreground lg:grid-cols-2">
      <div className="hidden h-full items-center border-r border-border bg-surface-2 text-foreground lg:flex">
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
          <LoginForm envs={envs.map(e => e.name)} defaultEnv={env} />
        </div>
      </div>
    </div>
  );
}
