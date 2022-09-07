import React, { FC, ReactNode } from "react";
import { Paper } from "@mui/material";

interface Props {
  children: ReactNode;
}

const GraphContainer: FC<Props> = ({ children }) => {
  return (
    <Paper elevation={0} sx={{ py: 2, px: 1, borderRadius: "24px" }}>
      {children}
    </Paper>
  );
};

export default GraphContainer;
