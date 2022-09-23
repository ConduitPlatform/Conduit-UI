import {
  Box,
  ClickAwayListener,
  Fade,
  Paper,
  PaperProps,
  Popper,
  PopperPlacementType,
  styled,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactElement } from "react";

interface Props {
  content: ReactElement;
  children: ReactElement;
  open: boolean;
  width?: string;
  padding?: string;
  radius?: string;
  size?: "sm" | "md";
  onClose: () => void;
  paperProps?: PaperProps;
  placement?: PopperPlacementType;
}

const useStyles = makeStyles({
  popper: {
    zIndex: 2000,
    '&[data-popper-placement*="bottom"]': {
      top: 0,
      left: 0,
      marginTop: "-0.71em",
      marginLeft: 4,
      marginRight: 4,
      "&::before": {
        transformOrigin: "0 100%",
      },
    },
    '&[data-popper-placement*="top"]': {
      bottom: 0,
      left: 0,
      marginBottom: "-0.71em",
      marginLeft: 4,
      marginRight: 4,
      "&::before": {
        transformOrigin: "100% 0",
      },
    },
    '&[data-popper-placement*="right"]': {
      left: 0,
      marginLeft: "-0.71em",
      height: "1em",
      width: "0.71em",
      marginTop: 4,
      marginBottom: 4,
      "&::before": {
        transformOrigin: "100% 100%",
      },
    },
    '&[data-popper-placement*="left"]': {
      right: 0,
      marginRight: "-0.71em",
      height: "1em",
      width: "0.71em",
      marginTop: 4,
      marginBottom: 4,
      "&::before": {
        transformOrigin: "0 0",
      },
    },
  },
});

const RichTooltip = ({
  placement = "top",
  open,
  size = "md",
  onClose,
  width = "216px",
  padding = "12px",
  radius = "8px",
  content,
  children,
  paperProps,
}: Props) => {
  const classes = useStyles();

  const [childNode, setChildNode] = React.useState<HTMLElement | null>(null);

  return (
    <div>
      {React.cloneElement(children, { ...children.props, ref: setChildNode })}
      <Popper
        open={open}
        anchorEl={childNode}
        className={classes.popper}
        placement={placement}
        transition
        modifiers={[
          {
            name: "flip",
            enabled: false,
            options: {
              altBoundary: true,
              rootBoundary: "viewport",
              padding: 6,
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: false,
              rootBoundary: "viewport",
              padding: 6,
            },
          },
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper {...paperProps} sx={{ borderRadius: radius }}>
              <ClickAwayListener onClickAway={onClose}>
                <Paper>
                  <Box maxWidth={width} p={padding}>
                    {content}
                  </Box>
                </Paper>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export default RichTooltip;
