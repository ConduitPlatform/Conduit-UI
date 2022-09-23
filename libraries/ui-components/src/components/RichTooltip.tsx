import {
  Box,
  ClickAwayListener,
  Fade,
  Paper,
  PaperProps,
  Popper,
  PopperPlacementType,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { ReactElement } from "react";

interface Props {
  content: ReactElement;
  children: ReactElement;
  open: boolean;
  width?: string;
  padding?: string;
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
  placement = "bottom",
  open,
  onClose,
  width = "216px",
  padding = "4px",
  content,
  children,
  paperProps,
}: Props) => {
  const classes = useStyles();
  const theme = useTheme();

  const [childNode, setChildNode] = React.useState<HTMLElement | null>(null);

  return (
    <div>
      {React.cloneElement(children, { ...children.props, ref: setChildNode })}
      <Popper
        sx={{ borderRadius: "24px" }}
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
            <Paper
              elevation={10}
              sx={{
                borderRadius: "24px",
                border: `1px solid ${theme.palette.primary.main}`,
              }}
              {...paperProps}
            >
              <ClickAwayListener onClickAway={onClose}>
                <Box maxWidth={width} p={padding}>
                  {content}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export default RichTooltip;
