import React, { FC } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EnumType from '../types/EnumType/EnumType';
import { BoxProps } from '@mui/material/Box/Box';
import GroupTypeViewer from './GroupTypeViewer';
import RelationTypeViewer from '../types/RelationType/RelationTypeViewer';
import BooleanTypeViewer from '../types/BooleanType/BooleanTypeViewer';
import ObjectIdTypeViewer from '../types/ObjectIdType/ObjectIdTypeViewer';
import SimpleTypeViewer from '../types/SimpleType/SimpleTypeViewer';
import { Grid } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '70vh',
    border: '1px',
    padding: theme.spacing(3, 5),
    minHeight: theme.spacing(65),
    borderRadius: '4px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

interface Props extends BoxProps {
  dataKey: any;
  data: any;
}

const SchemaViewer: FC<Props> = ({ dataKey, data, ...rest }) => {
  const classes = useStyles();

  const handleItemContent = (item: any, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? <EnumType item={item} /> : <SimpleTypeViewer item={item} />;
      case 'Number':
        return item.isEnum ? <EnumType item={item} /> : <SimpleTypeViewer item={item} />;
      case 'Date':
        return <SimpleTypeViewer item={item} />;
      case 'ObjectId':
        return <ObjectIdTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanTypeViewer item={item} />;
      case 'Relation':
        return <RelationTypeViewer item={item} />;
      case 'Group':
        return <GroupTypeViewer item={item} groupIndex={index} />;
      default:
        return null;
    }
  };

  return (
    <Box {...rest}>
      <div className={classes.list}>
        {data &&
          Array.isArray(data[dataKey]) &&
          data[dataKey].length > 0 &&
          data[dataKey].map((item: any, index: number) => (
            <div key={index} className={classes.item}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant={'body2'} style={{ marginRight: 8 }}>
                    <strong>{item.name}</strong>
                  </Typography>
                </Grid>
                {handleItemContent(item, index)}
              </Grid>
            </div>
          ))}
      </div>
    </Box>
  );
};

export default SchemaViewer;
