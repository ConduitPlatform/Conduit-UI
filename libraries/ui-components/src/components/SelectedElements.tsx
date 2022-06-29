import React, { FC } from "react";
import { Box, Button, Chip, Grid, Typography } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import { BoxProps } from "@mui/material/Box/Box";

interface Props extends BoxProps {
  disabled?: boolean;
  selectedElements: string[];
  removeSelectedElement: (value: number) => void;
  handleButtonAction: () => void;
  buttonText: string;
  header: string;
}

const SelectedElements: FC<Props> = ({
  disabled,
  selectedElements,
  removeSelectedElement,
  handleButtonAction,
  buttonText,
  header,
  ...rest
}) => {
  return (
    <Box {...rest}>
      <Grid item xs={12}>
        <Button
          disabled={disabled}
          sx={{ marginBottom: 1 }}
          variant="contained"
          color="primary"
          endIcon={<AddCircle />}
          onClick={() => handleButtonAction()}
        >
          {buttonText}
        </Button>
      </Grid>
      {selectedElements && selectedElements.length > 0 && (
        <>
          <Grid sx={{ textAlign: "center" }} item xs={12}>
            <Typography sx={{ textAlign: "center" }} variant="caption">
              {header}:
            </Typography>
          </Grid>
          <Grid
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              "& > *": {
                margin: 0.5,
              },
            }}
            item
            xs={12}
          >
            {selectedElements.map((element, index) => (
              <Chip
                key={index}
                size="small"
                label={element}
                onDelete={() => removeSelectedElement(index)}
              />
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SelectedElements;
