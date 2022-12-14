import React, { FC, useEffect, useState } from 'react';
import { getDocumentsByNameRequest } from '../../../http/DatabaseRequests';
import { Box, CircularProgress, IconButton, Select, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { RemoveRedEye } from '@mui/icons-material';

type RelationSelectInputProps = {
  value?: string;
  onChange: (val: string) => void;
  schemaModel: string;
  required?: boolean;
};

const menuHeight = 250;

const RelationSelectInput: FC<RelationSelectInputProps> = ({
  value,
  onChange,
  schemaModel,
  required = false,
}) => {
  const [relations, setRelations] = useState<any[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const requestRelationItems = async () => {
    setLoading(true);
    try {
      const params = {
        name: schemaModel,
        skip: 0,
        limit: limit,
        query: '',
      };
      const results = await getDocumentsByNameRequest(params);
      setRelations(results.data.documents);
      setDocCount(results.data.count);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    requestRelationItems();
  }, [limit]);

  const loadMoreItems = (event: any) => {
    if (event.target.scrollTop + menuHeight > event.target.scrollHeight - 0.5) {
      if (docCount > limit) setLimit((prevState) => prevState + 10);
    }
  };

  const selectIcon: FC = () => {
    return (
      <Box m={1}>
        <CircularProgress size={'20px'} color={'inherit'} />
      </Box>
    );
  };

  return (
    <Select
      disabled={loading}
      sx={{
        padding: 0,
        minWidth: 120,
        '& .MuiSelect-outlined': {
          padding: [1, 5, 1, 1],
        },
      }}
      placeholder={'Relation Id'}
      value={value}
      IconComponent={loading ? selectIcon : undefined}
      MenuProps={{
        PaperProps: {
          style: { maxHeight: menuHeight, overflowY: 'auto' },
          onScroll: loadMoreItems,
        },
      }}
      onChange={(event) => {
        onChange(event.target.value as string);
      }}
      renderValue={(renderedVal: any) => {
        return typeof value == 'string' ? (
          <Typography color={'primary'}>{renderedVal}</Typography>
        ) : (
          renderedVal?._id ?? 'Value not a string'
        );
      }}
      variant="outlined"
      required={required}>
      <MenuItem value={''}>None</MenuItem>
      {relations?.map((item) => (
        <MenuItem key={item._id} value={item._id}>
          {item._id}
          <IconButton
            onClick={(e) => {
              window.open(
                `/cms/schemadata?schemaModel=${schemaModel}&schemaDocumentId=${item._id}`
              );
              e.stopPropagation();
            }}
            size="large">
            <RemoveRedEye />
          </IconButton>
        </MenuItem>
      ))}
    </Select>
  );
};

export default RelationSelectInput;
