import React from "react";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import makeStyles from "@mui/styles/makeStyles";
import { ListItem, Theme, Tooltip, useTheme } from "@mui/material";
import clsx from "clsx";
import {alpha} from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    borderRadius: theme.spacing(0.5),
    color:
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.common.black,
    borderWidth: 1,
    "&:hover": {
      background: alpha(theme.palette.primary.dark,0.2),
      borderWidth: 1,
    },
    "&:focus": {
      background: alpha(theme.palette.primary.dark,0.2),
      borderWidth: 1,
    },
    "&.Mui-selected": {
      color: "white",
      background: theme.palette.primary.dark,
      borderWidth: 1,
      "&:hover": {
        background: theme.palette.primary.dark,
        borderWidth: 1,
      },
      "&:focus": {
        background: theme.palette.primary.dark,
        borderWidth: 1,
      },
    },
    width: "auto",
  },
}));

interface Props {
  title: string;
  icon: React.ReactElement;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
  fontSize?: number;
  smallScreen: boolean;
}

const ModuleItem: React.FC<Props> = ({
  selected,
  title,
  icon,
  onClick,
  className,
  disabled,
  fontSize,
  smallScreen,
  ...rest
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const capitalize = (title: string) => {
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <Tooltip title={smallScreen ? capitalize(title) : ""} placement={"right"}>
      <ListItem
        disabled={disabled}
        className={clsx(classes.listItem, className)}
        selected={selected}
        onClick={onClick}
        {...rest}
      >
        <ListItemIcon sx={{ minWidth: 25, color: "inherit" }}>
          {icon}
        </ListItemIcon>
        {smallScreen ? null : (
          <ListItemText
            primary={title}
            sx={{
              "&	.MuiListItemText-primary": {
                color: "inherit",
                textTransform: "capitalize",
                fontWeight: theme.palette.mode === "dark" ? "bold" : "regular",
                fontSize: fontSize ?? 12,
                marginLeft: 1,
              },
            }}
            primaryTypographyProps={{ noWrap: true }}
          />
        )}
      </ListItem>
    </Tooltip>
  );
};

ModuleItem.displayName = "CustomListItem";

export default ModuleItem;
