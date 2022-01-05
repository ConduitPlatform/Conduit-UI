import React, { FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dropContainer: {
    height: 240,
    padding: theme.spacing(0, 4),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
    textAlign: 'center',
    position: 'relative',

    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#fff',
  },
  fileName: {
    height: 'fit-content',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
    zIndex: 0,
  },
  image: {
    height: '100%',
    width: '100%',
    objectFit: 'contain',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 'auto',
    zIndex: 1,
  },
}));

interface Props {
  file: string;
  // url: string;
  fileName: string;
  mimeType: string;
  setFileName: (val: string) => void;
  setFile: (data: string, mimeType: string, name: string) => void;
}

const Dropzone: FC<Props> = ({
  mimeType,
  file,
  fileName,
  setFileName,
  // url,
  setFile,
}) => {
  const classes = useStyles();

  const handleSetFile = (readerFile: File) => {
    setFileName(readerFile.name);
    const reader = new FileReader();
    reader.readAsDataURL(readerFile);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const mimeType = reader.result.split(';')[0].split(':')[1];
        const base64 = reader.result.split(',')[1];
        setFile(base64, mimeType, readerFile.name);
      }
    };
    reader.onerror = (error) => {
      throw error;
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      handleSetFile(acceptedFiles[0]);
    },
  });

  const { ...rootProps } = getRootProps();
  const { ...inputProps } = getInputProps();

  const handleDropzoneText = () => {
    if (isDragActive) {
      return <Typography variant="body1">Drop the files here ...</Typography>;
    }
    return (
      <Typography variant="body1">
        {"Drag 'n' drop some files here, or click to select files"}
      </Typography>
    );
  };

  return (
    <Box {...rootProps}>
      <input {...inputProps} />
      <Box className={classes.dropContainer}>
        {file ? (
          <>
            {mimeType.includes('image') ? (
              <img
                src={`data:${mimeType};base64,` + file}
                alt={fileName}
                className={classes.image}
              />
            ) : (
              <Box className={classes.fileName}>{fileName}</Box>
            )}
          </>
        ) : (
          <>{handleDropzoneText()}</>
        )}
      </Box>
    </Box>
  );
};

export default Dropzone;
