import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  TableRowProps,
} from "@mui/material";
import Paper, { PaperProps } from "@mui/material/Paper";
import { IndeterminateCheckBox, KeyboardArrowDown } from "@mui/icons-material";
import DataTableRows from "./DataTableRows";

type Action = {
  title: string;
  type: string;
};

interface Props extends PaperProps {
  collapsible?: any;
  inner?: boolean;
  headers: any;
  sort?: { asc: boolean; index: string | null };
  setSort?: React.Dispatch<
    React.SetStateAction<{
      asc: boolean;
      index: string | null;
    }>
  >;
  dsData: any;
  selectable?: boolean;
  actions?: Action[];
  handleAction?: (action: Action, data: any) => void;
  selectedItems?: any[];
  handleSelect?: (id: string) => void;
  handleSelectAll?: (data: any) => void;
  handleRowClick?: (data: any) => void;
  tableRowProps?: TableRowProps;
  placeholder?: string;
  disableMultiSelect?: any;
}

const DataTable: React.FC<Props> = ({
  collapsible,
  inner,
  headers,
  sort,
  setSort,
  dsData = [],
  actions,
  handleAction,
  selectable = true,
  selectedItems = [],
  handleSelect,
  handleSelectAll,
  handleRowClick,
  tableRowProps,
  placeholder,
  disableMultiSelect,
  ...rest
}) => {
  const onSelectedField = (index: string) => {
    if (setSort !== undefined)
      setSort((prevState: { asc: boolean; index: string | null }) => {
        if (prevState.index === index) {
          return { asc: !prevState.asc, index: index };
        }
        return { asc: prevState.asc, index: index };
      });
  };

  const getHeaderValues = (value: string) => {
    if (value === "icon") {
      return "";
    }
    return value;
  };

  const onMenuItemSelectAll = () => {
    if (handleSelectAll) {
      handleSelectAll(dsData);
    }
  };

  const onRowClick = (item: any) => {
    if (handleRowClick) {
      handleRowClick(item);
    }
  };

  const handleDirection = (dir: boolean) => {
    if (dir) {
      return "asc";
    }
    return "desc";
  };

  return (
    <TableContainer
      sx={
        !inner
          ? { maxHeight: "65vh" }
          : { maxHeight: "65vh", backgroundColor: "background.default" }
      }
      component={Paper}
      {...rest}
    >
      <Table size="small" stickyHeader sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ backgroundColor: "primary.dark" }}
              align="left"
              padding="none"
            >
              {!collapsible && selectable && (
                <Checkbox
                  color="primary"
                  disabled={disableMultiSelect}
                  onChange={onMenuItemSelectAll}
                  checked={selectedItems?.length === dsData.length}
                  indeterminate={
                    selectedItems?.length > 0 &&
                    selectedItems?.length < dsData.length
                  }
                  indeterminateIcon={<IndeterminateCheckBox color="primary" />}
                />
              )}
            </TableCell>
            {headers.map((header: any, idx: number) => (
              <TableCell
                sx={{
                  backgroundColor: "primary.dark",
                  whiteSpace: "nowrap",
                  color: "common.white",
                }}
                key={idx}
              >
                {header.sort && sort ? (
                  <TableSortLabel
                    IconComponent={KeyboardArrowDown}
                    active={sort?.index === header.sort}
                    direction={handleDirection(sort?.asc)}
                    onClick={() => onSelectedField(header.sort)}
                  >
                    {getHeaderValues(header.title)}
                  </TableSortLabel>
                ) : (
                  <>{getHeaderValues(header.title)}</>
                )}
              </TableCell>
            ))}
            {actions && <TableCell sx={{ backgroundColor: "primary.dark" }} />}
          </TableRow>
        </TableHead>
        {dsData.length < 1 && placeholder ? (
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={headers.length + 3}
                sx={{ textAlign: "center" }}
              >
                {placeholder}
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {dsData.map((row: any, i: number) => (
              <DataTableRows
                collapsible={collapsible !== undefined ? collapsible[i] : null}
                row={row}
                index={i}
                handleAction={handleAction}
                handleSelect={handleSelect}
                selectedItems={selectedItems}
                key={i}
                actions={actions}
                onRowClick={onRowClick}
                selectable={selectable}
                tableRowProps={tableRowProps}
              />
            ))}
          </TableBody>
        )}
      </Table>
    </TableContainer>
  );
};

export default DataTable;
