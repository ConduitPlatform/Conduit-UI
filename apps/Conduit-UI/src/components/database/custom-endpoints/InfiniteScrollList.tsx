import React, { FC, forwardRef, useMemo } from 'react';
import {
  Typography,
  Skeleton,
  ListItemButton,
  ListItemIcon,
  Paper,
  ListItemText,
  useTheme,
} from '@mui/material';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { getOperation } from '../../../utils/getOperation';
import { Schema } from '../../../models/database/CmsModels';
import { Components, ItemProps, Virtuoso } from 'react-virtuoso';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';

interface Props {
  listItems: any[];
  count: number;
  loadMoreItems: (limit: number) => void;
  handleListItemSelect: (endpoint: any) => void;
  selectedEndpoint?: Schema;
  badge?: boolean;
  isEndpoint?: boolean;
}

interface FooterListProps {
  dataLength: number;
  dataTotalCount: number;
}

const MUIList: Components['List'] = forwardRef(({ children, style }, ref) => {
  return (
    <List
      style={{
        padding: 0,
        ...style,
      }}
      component="div"
      ref={ref}>
      {children}
    </List>
  );
});

MUIList.displayName = 'MuiList';

const EmptyList: Components['EmptyPlaceholder'] = () => {
  return <Typography sx={{ textAlign: 'center', pt: 1 }}>No rooms</Typography>;
};

const FooterList = ({ dataLength, dataTotalCount }: FooterListProps) => {
  return dataTotalCount <= dataLength ? null : (
    <Typography sx={{ textAlign: 'center' }}>Loading...</Typography>
  );
};

interface ListRow {
  index: number;
}

const InfiniteScrollList: FC<Props> = ({
  listItems,
  count,
  loadMoreItems,
  handleListItemSelect,
  selectedEndpoint,
  badge,
  isEndpoint,
}) => {
  const ListRow = ({ index }: ListRow) => {
    const listItem = listItems[index];
    const theme = useTheme();

    const getBadgeColor = (endpointForBadge: any) => {
      switch (endpointForBadge.operation) {
        case OperationsEnum.POST:
          return '#49cc90';
        case OperationsEnum.PUT:
          return '#fca130';
        case OperationsEnum.DELETE:
          return '#f93e3e';
        case OperationsEnum.GET:
          return '#61affe';
        case OperationsEnum.PATCH:
          return '#50e3c2';
      }
    };

    return (
      <>
        {!listItem ? (
          <Typography variant="h2">
            <Skeleton sx={{ marginRight: '8px' }} />
          </Typography>
        ) : (
          <ListItemButton
            sx={{
              '&.MuiListItemButton-root': {
                marginRight: '8px',
                color: theme.palette.mode === 'dark' ? 'common.white' : 'common.black',
                '&.Mui-selected': {
                  color: 'common.white',
                  background:
                    theme.palette.mode === 'dark' ? '#202030' : theme.palette.primary.dark,
                },
                borderRadius: '10px',
              },
            }}
            key={`endpoint-${listItem._id}`}
            onClick={() => handleListItemSelect(isEndpoint ? listItem : listItem.name)}
            selected={selectedEndpoint?._id === listItem?._id}>
            {badge ? (
              <ListItemIcon>
                <Paper
                  elevation={0}
                  sx={{
                    color: 'white',
                    padding: 0.2,
                    width: '65px',
                    textAlign: 'center',
                    marginRight: 1,
                    backgroundColor: getBadgeColor(listItem),
                  }}>
                  {getOperation(listItem)}
                </Paper>
              </ListItemIcon>
            ) : null}

            <ListItemText
              primary={listItem.name}
              primaryTypographyProps={{
                style: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
              }}
            />
          </ListItemButton>
        )}
      </>
    );
  };

  const endReached = useMemo(() => {
    if (listItems?.length === 0) return;
    return listItems?.length >= count ? undefined : loadMoreItems;
  }, [count, listItems?.length, loadMoreItems]);

  const MUIComponents: Components = useMemo(() => {
    return {
      List: MUIList,
      EmptyPlaceholder: EmptyList,
      Footer: () => FooterList({ dataLength: listItems?.length, dataTotalCount: count }),
      Item: ({ children, ...props }: ItemProps) => {
        return (
          <ListItem
            component="div"
            {...props}
            style={{ margin: 0, alignItems: 'stretch' }}
            disableGutters>
            {children}
          </ListItem>
        );
      },
    };
  }, [count, listItems?.length]);

  return (
    <Virtuoso
      data={listItems}
      endReached={endReached}
      itemContent={(index) => <ListRow index={index} />}
      components={MUIComponents}
      overscan={100}
      computeItemKey={(index, item) => `listItem-${item._id}${index}`}
    />
  );
};

export default InfiniteScrollList;
