import React, { FC, useState } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import DataTable from '../common/DataTable';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Paginator from '../common/Paginator';
import {
  ContainerDataProps,
  IStorageContainerData,
  IStorageFileData,
} from '../../models/storage/StorageModels';
import { asyncSetSelectedStorageFile } from '../../redux/slices/storageSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import StorageDownloadDialog from '../common/StorageDownloadDialog';

interface IContainerTable {
  icon: JSX.Element;
  Name: string;
  isPublic: boolean;
}

interface IContainerDataTable {
  icon: JSX.Element;
  Name: string;
  isPublic: boolean;
  mimeType: string;
}

type FormData = IContainerTable | IContainerDataTable;

interface Props {
  containers: IStorageContainerData[];
  containerData: ContainerDataProps[];
  path: string;
  handleAdd: () => void;
  handleCreateContainer: () => void;
  handleCreateFolder: () => void;
  // handleEdit: (value: boolean) => void;
  handlePathClick: (value: string) => void;
  handleDelete: (
    type: 'container' | 'folder' | 'file',
    id: string,
    name: string,
    container?: string
  ) => void;
  handlePageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleLimitChange: (value: number) => void;
  limit: number;
  page: number;
  count: number;
  placeholder?: string;
}

const StorageTable: FC<Props> = ({
  containers,
  containerData,
  path,
  handleAdd,
  handleCreateContainer,
  handleCreateFolder,
  handlePathClick,
  handleDelete,
  handlePageChange,
  handleLimitChange,
  limit,
  page,
  count,
  placeholder,
}) => {
  const dispatch = useAppDispatch();
  const appLoading = useAppSelector((state) => state.appSlice.loading);
  const fileUrl = useAppSelector((state) => state.storageSlice.data.selectedFileUrl);

  const [downloadModal, setDownloadModal] = useState<IStorageFileData | undefined>(undefined);

  const formatData = () => {
    if (path === '/')
      return containers.map((item: IStorageContainerData) => {
        return {
          icon: <FolderOpenIcon />,
          Name: item.name,
          isPublic: item.isPublic,
        };
      });
    return containerData.map((item: ContainerDataProps) => {
      if ('isFile' in item && item.isFile) {
        return {
          icon: <DescriptionIcon />,
          Name: item.name,
          isPublic: item.isPublic,
          mimeType: 'mimeType' in item ? item.mimeType : undefined,
        };
      }
      const folderNameSplit = item.name.split('/');
      const folderName = folderNameSplit[folderNameSplit.length - 2];
      return {
        icon: <FolderIcon />,
        Name: folderName,
        isPublic: item.isPublic,
        mimeType: undefined,
      };
    });
  };

  const handleAction = (action: { title: string; type: string }, data: FormData) => {
    if (path === '/') {
      const container = containers.find((item: IStorageContainerData) => item.name === data.Name);
      if (!container) return;
      handleDelete('container', container._id, container.name);
      return;
    }
    const foundFolder = containerData.find(
      (item: ContainerDataProps) => item.name === `${data.Name}/`
    );
    const foundItem = containerData.find((item: ContainerDataProps) => item.name === data.Name);

    if (foundItem && 'isFile' in foundItem && foundItem.isFile) {
      handleDelete('file', foundItem._id, foundItem.name);
      return;
    } else if (foundFolder) {
      handleDelete('folder', foundFolder._id, foundFolder.name, foundFolder.container);
    }
  };

  const deleteAction = {
    title: 'Delete',
    type: 'delete',
  };

  const actions = [deleteAction];

  const containerHeaders = [{ title: '' }, { title: 'Name' }, { title: 'is Public' }];
  const headers = [{ title: '' }, { title: 'Name' }, { title: 'is Public' }, { title: 'mimeType' }];

  const onPathClick = (item: string, index?: number) => {
    const file = containerData.find((itemFile: ContainerDataProps) => {
      return itemFile.name === item;
    });
    if (containerData.length > 0 && file && 'isFile' in file && file.isFile) {
      setDownloadModal(file);
      dispatch(asyncSetSelectedStorageFile(file));
      return;
    }
    //to be replaced with next dynamic routing
    const splitPath = path.split('/');
    if (index === splitPath.length - 1) return;
    if (index && splitPath.length - index >= 2) {
      const newPath = splitPath.slice(0, index);
      handlePathClick(`${newPath.join('/')}/${item}`);
      return;
    }
    if (index === 0) {
      handlePathClick('/');
      return;
    }
    if (splitPath[1]) {
      handlePathClick(`${path}/${item}`);
      return;
    }
    handlePathClick(`${path}${item}`);
  };

  return (
    <>
      <Grid container item xs={12} sx={{ justifyContent: 'space-between', marginBottom: 1 }}>
        <Grid item sx={{ display: 'flex' }}>
          {path.split('/').map((item, index) => {
            return (
              <Typography
                variant="subtitle1"
                sx={
                  item || index === 0
                    ? {
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }
                    : undefined
                }
                onClick={() => onPathClick(item, index)}
                key={index}>
                {index === 0 ? '..' : `/${item}`}
              </Typography>
            );
          })}
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            startIcon={<AddCircleOutline />}
            onClick={() => handleCreateContainer()}>
            Create Container
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            startIcon={<AddCircleOutline />}
            disabled={path === '/'}
            onClick={() => handleCreateFolder()}>
            Create Folder
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutline />}
            disabled={path === '/'}
            onClick={() => handleAdd()}>
            Add
          </Button>
        </Grid>
      </Grid>
      <DataTable
        dsData={formatData()}
        actions={actions}
        handleAction={handleAction}
        selectable={false}
        handleRowClick={(value) => onPathClick(value.Name)}
        headers={path === '/' ? containerHeaders : headers}
        tableRowProps={{
          sx: { cursor: 'pointer' },
        }}
        placeholder={placeholder}
      />
      {!placeholder && (
        <Grid container style={{ marginTop: '-8px' }}>
          <Grid item xs={7} />
          <Grid item xs={5}>
            <Paginator
              handlePageChange={handlePageChange}
              limit={limit}
              handleLimitChange={handleLimitChange}
              page={page}
              count={count}
            />
          </Grid>
        </Grid>
      )}

      <StorageDownloadDialog
        fileUrl={fileUrl}
        fileName={downloadModal?.name}
        fileMimeType={downloadModal?.mimeType}
        open={!!downloadModal && !appLoading && !!fileUrl}
        onClose={() => setDownloadModal(undefined)}
      />
    </>
  );
};

export default StorageTable;
