import { User } from '@/lib/models/User';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ParticipantsLogs } from '@/lib/models/chat';
import moment from 'moment';

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
            <div className="flex items-center pt-2">
              {logs.map(log => (
                <span className="text-xs text-muted-foreground">
                  {log.action.toUpperCase()}{' '}
                  {moment(log.createdAt).format('DD MMM YYYY')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
