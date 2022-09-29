import React, { FC, ReactNode } from "react";
import { Paper } from "@mui/material";

interface Props {
  children: ReactNode;
}

const GraphContainer: FC<Props> = ({ children }) => {
  return (
    <Paper
      elevation={0}
      sx={{ py: 1.3, px: 0.8, borderRadius: "24px", overflow: "hidden" }}
    >
      {children}
    </Paper>
  );
};

export default GraphContainer;
