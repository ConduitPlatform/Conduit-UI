import { Box } from "@mui/material";
import React, { FC } from "react";

const TableActionsContainer: FC = ({ children }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={1}
    >
      {children}
    </Box>
  );
};

export default TableActionsContainer;
