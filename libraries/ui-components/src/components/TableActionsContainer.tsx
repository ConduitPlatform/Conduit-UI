import { Box } from "@mui/material";
import React, { FC } from "react";
import { BoxProps } from "@mui/material/Box/Box";

const TableActionsContainer: FC<BoxProps> = ({ children, ...rest }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default TableActionsContainer;
