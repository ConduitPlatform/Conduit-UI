import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { IChatRoom } from '../../models/chat/ChatModels';
import useLongPress from '../../hooks/useLongPress';
import { Box, Skeleton } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    borderRadius: 8,
    padding: theme.spacing(1),
    overflow: 'hidden',
  },
}));

interface Props {
  data: IChatRoom;
  className?: string;
  onPress: () => void;
  onLongPress: () => void;
}

const ChatRoomTab: FC<Props> = ({ data, className, onPress, onLongPress, ...rest }) => {
  const classes = useStyles();

  const defaultOptions = {
    shouldPreventDefault: false,
    delay: 500,
  };
  const longPressEvent = useLongPress(onLongPress, onPress, defaultOptions);

  return (
    <Box className={clsx(classes.root, className)} {...longPressEvent} {...rest}>
      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data?.name}
      </Typography>
    </Box>
  );
};

export default ChatRoomTab;

export const ChatRoomTabSkeleton: FC = ({ ...rest }) => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: 1,
      }}
      {...rest}>
      <Skeleton
        animation="wave"
        variant="rectangular"
        height={32}
        sx={{ backgroundColor: 'grey.700', width: '100%' }}
      />
    </Box>
  );
};
