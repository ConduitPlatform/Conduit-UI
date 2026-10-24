import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2Icon } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

export const DeleteAlert = ({
  title,
  description,
  callback,
  compressed = true,
  buttonText,
}: {
  title: string;
  description: string;
  callback: () => void;
  compressed?: boolean;
  buttonText?: string;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {compressed ? (
          <button type="button">
            <Trash2Icon className="w-4 h-4" />
          </button>
        ) : (
          <Button variant="destructive">{buttonText}</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <span>{description}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => callback()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
