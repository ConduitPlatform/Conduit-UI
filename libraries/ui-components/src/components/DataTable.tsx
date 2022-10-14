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
  useTheme,
  Icon,
  styled,
  SvgIcon,
} from "@mui/material";
import Paper, { PaperProps } from "@mui/material/Paper";
import {
  IndeterminateCheckBox,
  KeyboardArrowDown,
  Remove,
} from "@mui/icons-material";
import DataTableRows from "./DataTableRows";
import ConduitCheckbox, { CheckedIcon } from "./ConduitCheckbox";

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
  const theme = useTheme();

  const Indeterminate = styled("span")(({ theme }) => ({
    borderRadius: 4,
    width: 18,
    height: 18,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 0 0 1px rgb(16 22 26 / 40%)"
        : "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    backgroundColor: theme.palette.primary.dark,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg class='svg-icon' style='width: 1em; height: 1em;vertical-align: middle;fill: white;overflow: hidden;' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M810.666667 469.333333H213.333333a42.666667 42.666667 0 0 0 0 85.333334h597.333334a42.666667 42.666667 0 0 0 0-85.333334z' /%3E%3C/svg%3E\")",
    content: '""',
    ".Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: theme.palette.primary.light,
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "rgba(57,75,89,.5)",
    },
  }));
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
          ? { maxHeight: "65vh", borderRadius: "12px" }
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
                <ConduitCheckbox
                  color="primary"
                  disabled={disableMultiSelect}
                  onChange={onMenuItemSelectAll}
                  checked={selectedItems?.length === dsData.length}
                  indeterminate={
                    selectedItems?.length > 0 &&
                    selectedItems?.length < dsData.length
                  }
                  indeterminateIcon={<Indeterminate />}
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
