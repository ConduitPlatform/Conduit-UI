import { Container, Paper } from "@mui/material";
import React, { FC } from "react";

const ConfigContainer: FC = ({ children }) => {
  return (
    <Container maxWidth="md">
      <Paper sx={{ padding: 4, color: "text.secondary", borderRadius: 7 }}>
        {children}
      </Paper>
    </Container>
  );
};

export default ConfigContainer;
