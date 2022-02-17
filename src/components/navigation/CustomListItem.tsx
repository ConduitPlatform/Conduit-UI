import React, { forwardRef } from 'react';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import { ListItem, Theme } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    minHeight: theme.spacing(3),
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(1, 0),
    color: theme.palette.primary.contrastText,
    borderWidth: 1,
    padding: theme.spacing(1.6),
    '&:hover': {
      borderWidth: 1,
    },
    '&:focus': {
      borderWidth: 1,
    },
    '&.Mui-selected': {
      color: 'white',
      background: theme.palette.secondary.dark,
      borderWidth: 1,
      '&:hover': {
        background: theme.palette.secondary.dark,
        borderWidth: 1,
      },
      '&:focus': {
        background: theme.palette.secondary.dark,
        borderWidth: 1,
      },
    },
  },
  listItemText: {
    color: 'inherit',
    textTransform: 'capitalize',
    fontWeight: 'bold',
    fontSize: 12,
  },
  listItemIcon: {
    minWidth: theme.spacing(4),
    marginRight: theme.spacing(1),
    color: 'inherit',
  },
  logoutContainer: {
    margin: 0,
    paddingLeft: theme.spacing(1),
  },
  link: {
    textDecoration: 'none',
  },
}));

interface Props {
  title: string;
  icon: React.ReactElement;
  href?: string;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
}

const CustomListItem = forwardRef<HTMLAnchorElement, Props>(
  ({ selected, title, icon, onClick, className, href, disabled, ...rest }, ref) => {
    const classes = useStyles();
    return (
      <a className={classes.link} href={href} onClick={onClick} ref={ref}>
        <ListItem
          disabled={disabled}
          button
          className={clsx(classes.listItem, className)}
          selected={selected}
          {...rest}>
          <ListItemIcon className={classes.listItemIcon}>{icon}</ListItemIcon>
          <ListItemText primary={title} classes={{ primary: classes.listItemText }} />
        </ListItem>
      </a>
    );
  }
);

CustomListItem.displayName = 'CustomListItem';

export default CustomListItem;
