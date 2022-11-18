import React, { isValidElement, useState } from "react";
import {
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  TableRowProps,
} from "@mui/material";
import DataTableActions from "./DataTableActions";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import moment from "moment";
import InnerTable from "./InnerTable";

type Action = {
  title: string;
  type: string;
};

interface Props {
  collapsible?: any;
  row: any;
  index: number;
  onRowClick: (item: any) => void;
  actions?: Action[];
  handleAction?: (action: Action, data: any) => void;
  selectedItems: any[];
  handleSelect?: (id: string) => void;
  handleSelectAll?: (data: any) => void;
  selectable: boolean;
  tableRowProps?: TableRowProps;
}

const DataTableRows: React.FC<Props> = ({
  collapsible,
  row,
  index,
  onRowClick,
  handleAction,
  handleSelect,
  selectedItems,
  actions,
  selectable,
  tableRowProps,
}) => {
  const [open, setOpen] = useState(false);

  const getValue = (value: any) => {
    if (moment(value, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]", true).isValid()) {
      return moment(value).format("DD/MM/YYYY");
    }
    if (isValidElement(value)) {
      return value;
    }
    return value?.toString();
  };

  const onMenuItemClick = (
    action: { title: string; type: string },
    data: any
  ) => {
    if (handleAction) {
      handleAction(action, data);
    }
  };

  const onMenuItemSelect = (id: string) => {
    if (handleSelect) {
      handleSelect(id);
    }
  };

  const isItemSelected = () => {
    if (selectedItems?.includes(row._id)) return true;
    const isItemFound = selectedItems.find((item) => item._id === row._id);
    if (isItemFound) return true;
    return false;
  };

  const extractIcon = () => {
    if (!collapsible && selectable)
      return (
        <Checkbox
          color="primary"
          checked={isItemSelected()}
          onChange={() => onMenuItemSelect(row._id)}
        />
      );
    if (collapsible)
      return (
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => setOpen(!open)}
        >
          {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      );
  };

  return (
    <>
      <TableRow
        onClick={() => onMenuItemSelect(row._id)}
        key={index}
        {...tableRowProps}
      >
        <TableCell align="left" padding="none">
          {extractIcon()}
        </TableCell>
        {Object.keys(row).map((item, j) => (
          <TableCell
            align="left"
            sx={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              width: item?.length > 0 ? "40px" : "350px",
            }}
            key={`row ${j}`}
          >
            {getValue(row[item])}
          </TableCell>
        ))}
        <TableCell key={`action-${row}`} align={"right"}>
          <DataTableActions
            actions={actions}
            onActionClick={(action) => onMenuItemClick(action, row)}
            isBlocked={!row.Active}
            editDisabled={selectedItems.length > 1}
          />
        </TableCell>
      </TableRow>
      {collapsible && <InnerTable open={open} collapsibleData={collapsible} />}
    </>
  );
};

export default DataTableRows;
