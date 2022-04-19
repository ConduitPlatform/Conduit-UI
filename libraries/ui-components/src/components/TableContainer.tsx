import { Box, Typography } from "@mui/material";
import React, { FC } from "react";
import Paginator from "./Paginator";

interface Props {
  count: number;
  page: number;
  limit: number;
  handlePageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => void;
  handleLimitChange: (value: number) => void;
  noData?: string;
}

const TableContainer: FC<Props> = ({
  children,
  count,
  page,
  limit,
  handleLimitChange,
  handlePageChange,
  noData,
}) => {
  return (
    <Box>
      {!noData ? (
        <Box>
          {children}
          <Box display="flex" justifyContent="flex-end" py={0.3}>
            <Paginator
              count={count}
              page={page}
              handleLimitChange={handleLimitChange}
              handlePageChange={handlePageChange}
              limit={limit}
            />
          </Box>
        </Box>
      ) : (
        <Typography sx={{ textAlign: "center", mt: "200px" }}>
          No available {noData}
        </Typography>
      )}
    </Box>
  );
};

export default TableContainer;
