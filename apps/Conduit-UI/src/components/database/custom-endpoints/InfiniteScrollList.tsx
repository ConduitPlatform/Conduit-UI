import React, { FC } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  ListItemButton,
  ListItemIcon,
  Paper,
  ListItemText,
  useTheme,
} from '@mui/material';
import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { OperationsEnum } from '../../../models/OperationsEnum';
import { getOperation } from '../../../utils/getOperation';
import { EndpointTypes, Schema } from '../../../models/database/CmsModels';

interface Props {
  listItems: EndpointTypes[] | Schema[];
  count: number;
  loaderRef: any;
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => void;
  handleListItemSelect: (endpoint: any) => void;
  selectedEndpoint?: Schema;
  badge?: boolean;
  isEndpoint?: boolean;
}

const InfiniteScrollList: FC<Props> = ({
  listItems,
  count,
  loaderRef,
  isItemLoaded,
  loadMoreItems,
  handleListItemSelect,
  selectedEndpoint,
  badge,
  isEndpoint,
}) => {
  const ListRow = ({ index, style }: ListChildComponentProps) => {
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
      <div style={style}>
        {!listItem ? (
          <Typography variant="h2">
            <Skeleton sx={{ marginRight: '8px' }} />
          </Typography>
        ) : (
          <ListItemButton
            sx={{
              '&.MuiListItemButton-root': {
                marginRight: '8px',
                '&.Mui-selected': {
                  background:
                    theme.palette.mode === 'dark' ? '#202030' : theme.palette.primary.light,
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
                  elevation={12}
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
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!count) {
          return (
            <Box width={width}>
              <Typography sx={{ textAlign: 'center', marginTop: '100px' }}>
                No endpoints available
              </Typography>
            </Box>
          );
        }
        return (
          <InfiniteLoader
            ref={loaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={count}
            loadMoreItems={loadMoreItems}
            threshold={4}>
            {({ onItemsRendered, ref }) => {
              return (
                <List
                  height={height}
                  itemCount={count}
                  itemSize={56}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  width={width}>
                  {ListRow}
                </List>
              );
            }}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
};

export default InfiniteScrollList;
