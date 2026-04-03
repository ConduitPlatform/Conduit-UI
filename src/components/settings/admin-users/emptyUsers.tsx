import { PlusIcon, UserPlus } from 'lucide-react';
export default function EmptyAdmins({
  userAdd,
}: Readonly<{ userAdd: () => void }>) {
  return (
    <div className="text-center">
      <UserPlus className={'w-8 h-8 mx-auto'} />
      <h3 className="mt-2 text-sm font-semibold text-foreground">
        No admin users
      </h3>
      <p className="mt-1 text-sm text-text-muted-foreground">
        Get started by creating a new one.
      </p>
      <div className="mt-6">
        <button
          onClick={userAdd}
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New User
        </button>
      </div>
    </div>
  );
}
