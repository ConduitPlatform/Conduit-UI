import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import GroupIcon from '@material-ui/icons/PlaylistAdd';
import React, { FC } from 'react';
import FieldIndicators from '../FieldIndicators';
import { BooleanGroupType } from '../types/BooleanType/BooleanType';
import { EnumGroupType } from '../types/EnumType/EnumType';
import { ObjectIdGroupType } from '../types/ObjectIdType/ObjectIdType';
import { RelationGroupType } from '../types/RelationType/RelationType';
import { SimpleGroupType } from '../types/SimpleType/SimpleType';

import {
  IGroupChildContentData,
  IGroupChildData,
  IGroupData,
} from '../../../models/cms/BuildTypesModels';
import GroupTypeChildViewer from './GroupTypeChildViewer';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    border: '1px dotted black',
  },
  groupIcon: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(1),
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

interface IProps {
  item: IGroupData;
  groupIndex: number;
}

const GroupTypeViewer: FC<IProps> = ({
  item,
  groupIndex,

  ...rest
}) => {
  const classes = useStyles();

  const handleGroupContent = (item: IGroupChildContentData | IGroupChildData, index: number) => {
    switch (item.type) {
      case 'Text':
        return item.isEnum ? (
          <EnumGroupType item={item} /> //needs changes
        ) : (
          <SimpleGroupType item={item} />
        );
      case 'Number':
        return item.isEnum ? <EnumGroupType item={item} /> : <SimpleGroupType item={item} />;
      case 'Date':
        return <SimpleGroupType item={item} />;
      case 'ObjectId':
        return <ObjectIdGroupType item={item} />;
      case 'Boolean':
        return <BooleanGroupType item={item} />;
      case 'Relation':
        return <RelationGroupType item={item} />;
      case 'Group':
        return <GroupTypeChildViewer item={item} groupIndex={groupIndex} itemIndex={index} />;
      default:
        return null;
    }
  };

  return (
    <Box style={{ width: '100%' }} {...rest}>
      <Grid container>
        <Grid container item xs={6} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Tooltip title={'Group field'}>
              <GroupIcon className={classes.groupIcon} />
            </Tooltip>
          </Box>
        </Grid>
        <Grid container item xs={6} alignItems={'center'} justifyContent={'flex-end'}>
          <Box display={'flex'} alignItems={'center'}>
            <FieldIndicators item={item} />
          </Box>
        </Grid>
      </Grid>

      <div className={classes.root}>
        {item.content &&
          Array.isArray(item.content) &&
          item.content.length > 0 &&
          item.content.map(
            (
              groupItem: any, //todo fix this
              index: number
            ) => (
              <div key={index} className={classes.item}>
                <Box width={'99%'}>{handleGroupContent(groupItem, index)}</Box>
                <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                  <Box display={'flex'} width={'100%'} justifyContent={'space-between'}>
                    <Box display={'flex'}>
                      <Typography variant={'body2'} style={{ marginRight: 8 }}>
                        {groupItem.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </div>
            )
          )}
      </div>
    </Box>
  );
};

export default GroupTypeViewer;
