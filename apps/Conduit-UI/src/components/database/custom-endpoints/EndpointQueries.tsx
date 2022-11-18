import React, { FC, useState } from 'react';
import CustomQueryRow from './CustomQueryRow';
import TreeItemContent from './TreeItemContent';
import { Grid, Box, Typography } from '@mui/material';
import { TreeItem, TreeItemContentProps, TreeItemProps, TreeView, useTreeItem } from '@mui/lab';
import { deepClone } from '../../../utils/deepClone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { v4 as uuidV4 } from 'uuid';
import clsx from 'clsx';

interface Props {
  editMode: boolean;
  selectedInputs: any;
  selectedSchema: any;
  selectedQueries: any;
  handleAddQuery: (nodeId: any) => void;
  handleAddNode: (nodeId: any) => void;
  handleRemoveNode: (nodeId: any) => void;
  setSelectedQueries: (queries: any) => void;
  handleChangeNodeOperator: (nodeId: any, oldOperator: any, newOperator: any) => void;
}

const EndpointQueries: FC<Props> = ({
  editMode,
  selectedSchema,
  selectedQueries,
  selectedInputs,
  handleAddQuery,
  handleAddNode,
  handleRemoveNode,
  setSelectedQueries,
  handleChangeNodeOperator,
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const deconstructQueries = (queries: any) => {
    let allQueries: any = [];
    queries.forEach((query: any) => {
      if ('operator' in query) {
        allQueries = allQueries.concat(deconstructQueries(query.queries));
      } else {
        allQueries.push(query);
      }
    });

    return allQueries;
  };

  const findModifiedQuery = (allQueries: any, queryId: any) => {
    allQueries = deconstructQueries(allQueries);
    return allQueries.find((q: any) => q._id === queryId);
  };

  const handleToggle = (nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleQueryFieldChange = (event: React.ChangeEvent<{ value: any }>, queryId: string) => {
    const currentQueries = deepClone(selectedQueries);
    const foundQuery = findModifiedQuery(currentQueries, queryId);
    const value = event.target.value;
    if (foundQuery) {
      foundQuery.schemaField = value;
      setSelectedQueries(currentQueries);
    }
  };

  const handleQueryComparisonFieldChange = (
    event: React.ChangeEvent<{ value: any }>,
    queryId: string
  ) => {
    const currentQueries = deepClone(selectedQueries);
    const foundQuery = findModifiedQuery(currentQueries, queryId);

    const value = event.target.value;
    const type = value.split('-')[0];
    const actualValue = value.split('-')[1];
    if (foundQuery) {
      foundQuery.comparisonField.type = type;
      foundQuery.comparisonField.value = actualValue ? actualValue : '';
      setSelectedQueries(currentQueries);
    }
  };

  const handleCustomValueChange = (event: React.ChangeEvent<{ value: any }>, queryId: string) => {
    const value = event;
    const currentQueries = deepClone(selectedQueries);
    const foundQuery = findModifiedQuery(currentQueries, queryId);
    if (foundQuery) {
      foundQuery.comparisonField.value = value;
      setSelectedQueries(currentQueries);
    }
  };

  const handleQueryConditionChange = (
    event: React.ChangeEvent<{ value: any }>,
    queryId: string
  ) => {
    const value = event.target.value;
    const currentQueries = deepClone(selectedQueries);
    const foundQuery = findModifiedQuery(currentQueries, queryId);
    if (foundQuery) {
      foundQuery.operation = Number(value);
      setSelectedQueries(currentQueries);
    }
  };

  const handleLikeValueChange = (
    event: React.ChangeEvent<{ checked: boolean }>,
    queryId: string
  ) => {
    const currentQueries = deepClone(selectedQueries);

    const foundQuery = findModifiedQuery(currentQueries, queryId);

    if (foundQuery) {
      foundQuery.comparisonField.like = !foundQuery.comparisonField.like;
      setSelectedQueries(currentQueries);
    }
  };

  const handleRemoveQuery = (queryId: string) => {
    const currentQueries = deepClone(selectedQueries);
    let foundIndex = -1;

    currentQueries.forEach((topNode: any) => {
      topNode.queries.forEach((q1: any, index1: number) => {
        if (q1._id === queryId) {
          foundIndex = index1;
        }
        if (foundIndex !== -1) {
          topNode.queries.splice(foundIndex, 1);
        } else {
          if ('queries' in q1) {
            q1.queries.forEach((q2: any, index2: number) => {
              if (q2._id === queryId) {
                foundIndex = index2;
              }
              if (foundIndex !== -1) {
                q1.queries.splice(foundIndex, 1);
              } else {
                q2.queries.forEach((q3: any, index3: number) => {
                  if (q3._id === queryId) {
                    foundIndex = index3;
                  }
                  if (foundIndex !== -1) {
                    q2.queries.splice(foundIndex, 1);
                  }
                });
              }
            });
          }
        }
      });
    });

    setSelectedQueries(currentQueries);
  };

  const handleOperatorChange = (index: number, oldOperator: any, newOperator: any) => {
    handleChangeNodeOperator(index, oldOperator, newOperator);
  };

  const handleAdd = (nodeId: string) => {
    handleAddQuery(nodeId);
    if (expanded[0] !== nodeId) {
      setExpanded([...expanded, nodeId]);
    }
  };

  const CustomContent = React.forwardRef(function CustomContent(props: TreeItemContentProps, ref) {
    const { classes, className, label, nodeId, icon: iconProp, expansionIcon, displayIcon } = props;

    const {
      disabled,
      expanded,
      selected,
      focused,
      handleExpansion,
      handleSelection,
      preventSelection,
    } = useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      preventSelection(event);
    };

    const handleExpansionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      handleExpansion(event);
    };

    const handleSelectionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      handleSelection(event);
    };

    return (
      <div
        onMouseDown={handleMouseDown}
        ref={ref as React.Ref<HTMLDivElement>}
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled,
        })}>
        <div onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography onClick={handleSelectionClick} component="div" className={classes.label}>
          {label}
        </Typography>
      </div>
    );
  });

  const CustomTreeItem = (props: TreeItemProps) => (
    <TreeItem sx={{ p: 0.2 }} ContentComponent={CustomContent} {...props} />
  );

  const renderItem = (node: any) => {
    if ('operator' in node && node.queries) {
      return (
        <CustomTreeItem
          key={node._id ? node._id : uuidV4()}
          nodeId={node._id ? node._id : 'defaultNodeId'}
          label={
            <TreeItemContent
              editMode={editMode}
              operator={node.operator}
              key={node._id}
              handleAddQuery={() => handleAdd(node._id)}
              handleAddNode={() => handleAddNode(node._id)}
              handleRemoveNode={() => handleRemoveNode(node._id)}
              handleOperatorChange={(operator: any) =>
                handleOperatorChange(node._id, node.operator, operator)
              }
            />
          }>
          {node.queries.map((q: any) => renderItem(q))}
        </CustomTreeItem>
      );
    }
    if ('schemaField' in node) {
      return (
        <CustomTreeItem
          key={node._id ? node._id : uuidV4()}
          nodeId={node._id}
          label={
            <Grid
              container
              alignItems={'flex-end'}
              spacing={2}
              sx={{ p: 1.5, marginTop: 0.4 }}
              key={`query-${selectedSchema}-${node._id}`}>
              <CustomQueryRow
                query={node}
                index={node._id}
                selectedInputs={selectedInputs}
                editMode={editMode}
                handleQueryFieldChange={handleQueryFieldChange}
                handleQueryComparisonFieldChange={handleQueryComparisonFieldChange}
                handleCustomValueChange={handleCustomValueChange}
                handleQueryConditionChange={handleQueryConditionChange}
                handleLikeValueChange={handleLikeValueChange}
                handleRemoveQuery={() => handleRemoveQuery(node._id)}
              />
            </Grid>
          }
        />
      );
    }
  };

  return (
    <Box width={'100%'}>
      <TreeView
        expanded={expanded}
        sx={{ flexGrow: 1, overflowY: 'auto', padding: 0.1 }}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={(e: React.ChangeEvent<any>) => e.preventDefault()}
        onNodeToggle={(event, nodeIds) => handleToggle(nodeIds)}>
        {selectedQueries.map((q: any) => renderItem(q))}
      </TreeView>
    </Box>
  );
};

export default EndpointQueries;
