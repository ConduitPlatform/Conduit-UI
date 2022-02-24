import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import GroupIcon from '@material-ui/icons/PlaylistAdd';
import React, { FC } from 'react';
import FieldIndicators from '../FieldIndicators';
import {
  IGroupChildContentData,
  IGroupChildData,
  IGroupData,
} from '../../../models/cms/BuildTypesModels';
import GroupTypeChildViewer from './GroupTypeChildViewer';
import { SimpleGroupTypeViewer } from '../types/SimpleType/SimpleTypeViewer';
import { ObjectIdGroupTypeViewer } from '../types/ObjectIdType/ObjectIdTypeViewer';
import { BooleanGroupTypeViewer } from '../types/BooleanType/BooleanTypeViewer';
import { RelationGroupTypeViewer } from '../types/RelationType/RelationTypeViewer';
import { EnumGroupTypeViewer } from '../types/EnumType/EnumTypeViewer';

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
          <EnumGroupTypeViewer item={item} /> //needs changes
        ) : (
          <SimpleGroupTypeViewer item={item} />
        );
      case 'Number':
        return item.isEnum ? (
          <EnumGroupTypeViewer item={item} />
        ) : (
          <SimpleGroupTypeViewer item={item} />
        );
      case 'Date':
        return <SimpleGroupTypeViewer item={item} />;
      case 'ObjectId':
        return <ObjectIdGroupTypeViewer item={item} />;
      case 'Boolean':
        return <BooleanGroupTypeViewer item={item} />;
      case 'Relation':
        return <RelationGroupTypeViewer item={item} />;
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
                <Box width={'99%'}></Box>
                <Box display={'flex'} flexDirection={'column'} width={'99%'} mb={2}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant={'body2'} style={{ marginRight: 8 }}>
                        {groupItem.name}
                      </Typography>
                    </Grid>
                    {handleGroupContent(groupItem, index)}
                  </Grid>
                </Box>
              </div>
            )
          )}
      </div>
    </Box>
  );
};

export default GroupTypeViewer;
