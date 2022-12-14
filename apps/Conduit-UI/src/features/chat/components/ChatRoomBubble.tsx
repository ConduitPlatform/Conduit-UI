import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { IChatMessage } from '../models/ChatModels';
import { Tooltip } from '@mui/material';
import moment from 'moment';
import useLongPress from '../../../hooks/useLongPress';
import { Skeleton } from '@mui/material';
import { AuthUser } from '../../authentication/models/AuthModels';

const classes = {
  root: {
    display: 'flex',
  },
};

interface Props {
  data: IChatMessage;
  className?: string;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

const ChatRoomBubble: FC<Props> = ({ data, className, onPress, onLongPress, ...rest }) => {
  const user: AuthUser = data?.senderUser;

  const handleLongPress = () => {
    onLongPress(data._id);
  };

  const handlePress = () => {
    onPress(data._id);
  };

  const defaultOptions = {
    shouldPreventDefault: false,
    delay: 500,
  };
  const longPressEvent = useLongPress(handleLongPress, handlePress, defaultOptions);

  const stringToColour = function (str = 'Quint') {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  };

  return (
    <div className={clsx(classes.root, className)} {...longPressEvent} {...rest}>
      <Box>
        <Tooltip title={user?.email ?? ''} placement="left" key={user?.email}>
          <Box
            sx={{
              height: 35,
              width: 35,
              borderRadius: '50%',
              backgroundColor: stringToColour(user?.email),
              marginRight: 2,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Typography sx={{ textTransform: 'capitalize' }}>{user?.email?.charAt(0)}</Typography>
          </Box>
        </Tooltip>
      </Box>
      <Tooltip
        title={`Sent: ${moment(data?.createdAt).format('MMM Do YYYY, h:mm:ss a')}`}
        placement="right">
        <Box
          sx={{
            backgroundColor: 'gray',
            borderRadius: 2,
            padding: 1,
          }}>
          <Typography variant="body2">{data?.message}</Typography>
        </Box>
      </Tooltip>
    </div>
  );
};

export default ChatRoomBubble;

interface SkeletonProps {
  className: string;
}

export const ChatRoomBubbleSkeleton: FC<SkeletonProps> = ({ className, ...rest }) => {
  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <Skeleton
        animation="wave"
        variant="circular"
        height={35}
        width={35}
        sx={{ backgroundColor: 'gray', width: '30%', mr: 2 }}
      />
      <Skeleton
        animation="wave"
        variant="rectangular"
        height={32}
        sx={{
          backgroundColor: 'gray',
          width: '30%',
          borderRadius: 2,
        }}
      />
    </div>
  );
};
