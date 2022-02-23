import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import SimpleType from './../types/SimpleType/SimpleType';
import BooleanType from './../types/BooleanType/BooleanType';
import EnumType from './../types/EnumType/EnumType';
import ObjectIdType from './../types/ObjectIdType/ObjectIdType';
import RelationType from './../types/RelationType/RelationType';
import { BoxProps } from '@material-ui/core/Box/Box';
import GroupTypeViewer from './GroupTypeViewer';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '70vh',
    border: '1px',
    padding: theme.spacing(4, 10),
    minHeight: theme.spacing(65),
    borderRadius: '4px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderLeft: '1px solid #dce0e5',
  },
}));

interface Props extends BoxProps {
  dataKey: any;
  data: any;
}

const SchemaViewer: FC<Props> = ({
  dataKey,
  data,

  ...rest
}) => {
  const classes = useStyles();

  const handleItemContent = (item: any, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? <EnumType item={item} /> : <SimpleType item={item} />;
      case 'Number':
        return item.isEnum ? <EnumType item={item} /> : <SimpleType item={item} />;
      case 'Date':
        return <SimpleType item={item} />;
      case 'ObjectId':
        return <ObjectIdType item={item} />;
      case 'Boolean':
        return <BooleanType item={item} />;
      case 'Relation':
        return <RelationType item={item} />;
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
              <Box width={'99%'}>{handleItemContent(item, index)}</Box>
              <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                <Box display={'flex'} width={'100%'} justifyContent={'space-between'}>
                  <Box display={'flex'}>
                    <Typography variant={'body2'} style={{ marginRight: 8 }}>
                      Field name: <strong>{item.name}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </div>
          ))}
      </div>
    </Box>
  );
};

export default SchemaViewer;
