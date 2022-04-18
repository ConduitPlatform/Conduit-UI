import { alpha } from "@mui/material/styles";
import withStyles from "@mui/styles/withStyles";
import TreeItem from "@mui/lab/TreeItem";
import React from "react";
import TransitionComponent from "./TransitionComponent";

const StyledTreeItem = withStyles((theme) => ({
  root: {
    "& .MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label":
      {
        background: "none",
      },
    marginBottom: 7,
  },
  iconContainer: {
    "& .close": {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 7,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}))((props) => (
  <TreeItem nodeId={""} {...props} TransitionComponent={TransitionComponent} />
));

export default StyledTreeItem;
