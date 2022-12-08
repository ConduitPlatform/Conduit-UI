import React, { useEffect, useState } from 'react';
import {
  Typography,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
  Button,
  InputAdornment,
  TextField,
  IconButton,
} from '@mui/material';
import { DataTable, Paginator } from '@conduitplatform/ui-components';
import { Search as SearchIcon, Close } from '@mui/icons-material';
import useDebounce from '../../hooks/useDebounce';

interface Props {
  open: boolean;
  singleSelect?: boolean;
  title?: string;
  headers?: { title: string; sort?: string }[];
  returnSelected?: string[];
  buttonText?: string;
  handleClose: () => void;
  data: { tableData: any[]; count: number };
  getData: any;
  externalElements?: any[];
  dialogAction?: any;
  setExternalElements?: (values: any[]) => void;
  disableSelectAllButton?: boolean;
}

const TableDialog: React.FC<Props> = ({
  open,
  singleSelect,
  title,
  headers,
  buttonText,
  handleClose,
  data,
  getData,
  dialogAction,
  externalElements,
  setExternalElements,
}) => {
  const [page, setPage] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(25);
  const [search, setSearch] = useState<string>('');
  const [selectedElements, setSelectedElements] = useState<any[]>([]);
  const debouncedSearch: string = useDebounce(search, 500);

  useEffect(() => {
    getData({ skip, limit, search, debouncedSearch });
  }, [skip, limit, search, debouncedSearch, getData]);

  useEffect(() => {
    setSkip(0);
    setPage(0);
    setLimit(25);
  }, [debouncedSearch]);

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setSkip(0);
    setPage(0);
  };

  useEffect(() => {
    if (externalElements !== undefined && externalElements.length >= 0) {
      setSelectedElements(externalElements);
    }
  }, [externalElements]);

  const handleAction = () => {
    if (externalElements !== undefined && setExternalElements !== undefined) {
      setExternalElements(selectedElements);
    }
    if (dialogAction) {
      dialogAction(selectedElements);
    }
    handleClose();
  };

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, val: number) => {
    if (val > page) {
      setPage(page + 1);
      setSkip(skip + limit);
    } else {
      setPage(page - 1);
      setSkip(skip - limit);
    }
  };

  const handleSelect = (id: string) => {
    const foundTemplate = data.tableData.find((item) => item._id === id);
    const newSelectedElements = [...selectedElements];

    if (singleSelect) {
      setSelectedElements([foundTemplate]);
      return;
    }
    const templateChecked = selectedElements.find((template) => template._id === foundTemplate._id);

    if (templateChecked) {
      const index = newSelectedElements.findIndex((newId) => newId === foundTemplate._id);
      newSelectedElements.splice(index, 1);
    } else {
      newSelectedElements.push(foundTemplate);
    }
    setSelectedElements(newSelectedElements);
  };

  const handleSelectAll = (elements: any) => {
    if (singleSelect) return;
    if (selectedElements.length === elements.length) {
      setSelectedElements([]);
      return;
    }
    setSelectedElements(data.tableData);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={open}
      PaperProps={{
        sx: {
          height: '93vh',
          borderRadius: '16px',
        },
      }}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <IconButton
        aria-label="Close"
        sx={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          color: 'primary',
        }}
        onClick={handleClose}
        size="large">
        <Close />
      </IconButton>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <TextField
          sx={{ mb: 1 }}
          margin="dense"
          size="small"
          variant="outlined"
          name="Search"
          value={search}
          autoFocus
          onChange={(e) => setSearch(e.target.value)}
          label="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {data.tableData.length ? (
          <>
            <DataTable
              disableSelectAllButton
              headers={headers}
              dsData={data.tableData}
              handleSelect={handleSelect}
              handleSelectAll={handleSelectAll}
              selectedItems={selectedElements}
            />
            <Paginator
              count={data.count}
              limit={limit}
              page={page}
              handleLimitChange={handleLimitChange}
              handlePageChange={handlePageChange}
            />
          </>
        ) : (
          <Typography textAlign="center" sx={{ mt: '50px' }}>
            No content available{' '}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="outlined">
          Cancel
        </Button>
        <Button
          disabled={selectedElements.length < 1}
          onClick={() => handleAction()}
          color="primary"
          variant="contained"
          autoFocus>
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableDialog;
