import React from "react";
import Grid, { GridProps } from "@mui/material/Grid";
import TablePagination from "@mui/material/TablePagination";
import { Paper } from "@mui/material";

interface Props extends GridProps {
  page: number;
  limit: number;
  handlePageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  handleLimitChange: (value: number) => void;
  count: number;
}

const Paginator: React.FC<Props> = ({
  handlePageChange,
  page,
  limit,
  handleLimitChange,
  count,
  ...rest
}) => {
  return (
    <Grid container justifyContent="flex-end" {...rest}>
      <Paper elevation={0} sx={{ mt: 2, borderRadius: 4 }}>
        <TablePagination
          color="primary"
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={count}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={(event) =>
            handleLimitChange(parseInt(event.target.value))
          }
        />
      </Paper>
    </Grid>
  );
};

export default Paginator;
