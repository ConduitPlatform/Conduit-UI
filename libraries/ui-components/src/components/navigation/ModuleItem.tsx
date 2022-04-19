import React, { forwardRef } from "react";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import makeStyles from "@mui/styles/makeStyles";
import { ListItem, styled, Theme } from "@mui/material";
import clsx from "clsx";

const StyledAtag = styled("a")(() => ({
  textDecoration: "none",
}));

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    minHeight: theme.spacing(3),
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(1, 0),
    color: theme.palette.primary.contrastText,
    borderWidth: 1,
    padding: theme.spacing(1.6),
    "&:hover": {
      borderWidth: 1,
    },
    "&:focus": {
      borderWidth: 1,
    },
    "&.Mui-selected": {
      color: "white",
      background: theme.palette.secondary.dark,
      borderWidth: 1,
      "&:hover": {
        background: theme.palette.secondary.dark,
        borderWidth: 1,
      },
      "&:focus": {
        background: theme.palette.secondary.dark,
        borderWidth: 1,
      },
    },
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

const ModuleItem = forwardRef<HTMLAnchorElement, Props>(
  (
    { selected, title, icon, onClick, className, href, disabled, ...rest },
    ref
  ) => {
    const classes = useStyles();
    return (
      <StyledAtag href={href} onClick={onClick} ref={ref}>
        <ListItem
          disabled={disabled}
          button
          className={clsx(classes.listItem, className)}
          selected={selected}
          {...rest}
        >
          <ListItemIcon sx={{ minWidth: 35, marginRight: 1, color: "inherit" }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={title}
            sx={{
              "&	.MuiListItemText-primary": {
                color: "inherit",
                textTransform: "capitalize",
                fontWeight: "bold",
                fontSize: 12,
              },
            }}
          />
        </ListItem>
      </StyledAtag>
    );
  }
);

ModuleItem.displayName = "CustomListItem";

export default ModuleItem;
