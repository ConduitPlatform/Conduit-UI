import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { IChatMessage } from '../../models/chat/ChatModels';
import { Tooltip } from '@mui/material';
import moment from 'moment';
import useLongPress from '../../hooks/useLongPress';
import { Skeleton } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  contentContainer: {
    backgroundColor: theme.palette.grey[700],
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 2),
    maxWidth: '80%',
  },
  skeletonContentContainer: {
    backgroundColor: theme.palette.grey[700],
    width: '30%',
    borderRadius: theme.spacing(2),
  },
  iconOuterContainer: {
    alignSelf: 'flex-end',
  },
  iconContainer: {
    height: theme.spacing(4),
    width: theme.spacing(4),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(1),
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonIconContainer: {
    backgroundColor: theme.palette.grey[700],
    marginRight: theme.spacing(1),
  },
  name: {
    textTransform: 'capitalize',
  },
}));

interface Props {
  data: IChatMessage;
  className?: string;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

const ChatRoomBubble: FC<Props> = ({ data, className, onPress, onLongPress, ...rest }) => {
  const classes = useStyles();

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

  return (
    <div className={clsx(classes.root, className)} {...longPressEvent} {...rest}>
      <Box className={classes.iconOuterContainer}>
        <Tooltip title={data.senderUser.email} placement="left">
          <Box className={classes.iconContainer}>
            <Typography className={classes.name}>{data.senderUser.email.charAt(0)}</Typography>
          </Box>
        </Tooltip>
      </Box>
      <Tooltip
        title={`Sent: ${moment(data?.createdAt).format('MMM Do YYYY, h:mm:ss a')}`}
        placement="right">
        <Box className={classes.contentContainer}>
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
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <Skeleton
        animation="wave"
        variant="circular"
        height={32}
        width={32}
        className={classes.skeletonIconContainer}
      />
      <Skeleton
        animation="wave"
        variant="rectangular"
        height={32}
        className={classes.skeletonContentContainer}
      />
    </div>
  );
};
