import React, { FC, useEffect, useState } from 'react';
import { getCmsDocumentsByNameRequest } from '../../../../http/CmsRequests';
import { IconButton, Select, Typography } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import { RemoveRedEye } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  muiSelect: {
    padding: 0,
    minWidth: 120,
    '& .MuiSelect-outlined': {
      padding: theme.spacing(1, 5, 1, 1),
    },
  },
}));

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
  const classes = useStyles();
  const [relations, setRelations] = useState<any[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [limit, setLimit] = useState(10);

  const requestRelationItems = async () => {
    try {
      const params = {
        name: schemaModel,
        skip: 0,
        limit: limit,
        query: '',
      };
      const results = await getCmsDocumentsByNameRequest(params);
      setRelations(results.data.documents);
      setDocCount(results.data.count);
    } catch (e) {}
  };

  useEffect(() => {
    requestRelationItems();
  }, [limit]);

  const loadMoreItems = (event: any) => {
    if (event.target.scrollTop + menuHeight > event.target.scrollHeight - 0.5) {
      if (docCount > limit) setLimit((prevState) => prevState + 10);
    }
  };

  return (
    <Select
      className={classes.muiSelect}
      placeholder={'Relation Id'}
      value={value}
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
            }}>
            <RemoveRedEye />
          </IconButton>
        </MenuItem>
      ))}
    </Select>
  );
};

export default RelationSelectInput;
