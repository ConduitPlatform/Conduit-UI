import React, { FC, useEffect, useState } from 'react';
import { getCmsDocumentsByNameRequest } from '../../../../http/CmsRequests';
import { Select } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';

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
    } catch (e) {}
  };

  useEffect(() => {
    requestRelationItems();
  }, [limit]);

  const loadMoreItems = (event: any) => {
    if (event.target.scrollTop + menuHeight > event.target.scrollHeight - 0.5) {
      setLimit((prevState) => prevState + 10);
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
      variant="outlined"
      required={required}>
      <MenuItem value={''}>None</MenuItem>
      {relations?.map((item) => (
        <MenuItem key={item._id} value={item._id}>
          {item._id}
        </MenuItem>
      ))}
    </Select>
  );
};

export default RelationSelectInput;
