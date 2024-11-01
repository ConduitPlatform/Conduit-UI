import { User } from '@/lib/models/User';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ParticipantsLogs } from '@/lib/models/chat';
import moment from 'moment';
import { Separator } from '@/components/ui/separator';

export const Profile = ({
  user,
  logs,
}: {
  user: User;
  logs: ParticipantsLogs[];
}) => {
  const initials = user.email.slice(0, 2).toUpperCase();
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Avatar>
          <AvatarImage src={''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-start space-x-4">
          <Avatar>
            <AvatarImage src={''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{user.email}</h4>
            <p className="text-sm">
              {user.isVerified ? 'isVerified' : 'Not Verified'}
            </p>
            <div className="flex flex-col pt-2">
              <Separator className="my-3" />
              <span className="text-sm">History</span>
              <div className="h-30 overflow-auto flex flex-col justify-start">
                {logs.map(log => {
                  if ((log.user as User)._id === user._id)
                    return (
                      <span
                        key={user._id}
                        className="text-xs text-muted-foreground"
                      >
                        {log.action.toUpperCase()}{' '}
                        {moment(log.createdAt).format('DD MMM YYYY')}
                      </span>
                    );
                })}
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
