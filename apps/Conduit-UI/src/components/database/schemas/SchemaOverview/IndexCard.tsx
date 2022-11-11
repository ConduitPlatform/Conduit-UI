import { Close } from '@mui/icons-material';
import {
  Box,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import React, { FC } from 'react';

interface Props {
  index: any;
}

const IndexCard: FC<Props> = ({ index }) => {
  const theme = useTheme();

  const handleDeleteIndex = () => {
    console.log('deleted');
  };

  return (
    <Card
      elevation={0}
      sx={{
        background: theme.palette.mode === 'dark' ? '#262840' : '#F2F2F2',
        borderRadius: '15px',
        height: '100%',
        position: 'relative',
      }}>
      <Box
        sx={{
          zIndex: 10,
          position: 'absolute',
          right: 0,
          top: 0,
          padding: 0.5,
          paddingBottom: 0,
        }}>
        <IconButton onClick={() => handleDeleteIndex()} sx={{ p: 1 }} size="large">
          <Close />
        </IconButton>
      </Box>
      <Box display="flex" flexDirection="column" gap={2} p={2}>
        <Typography>Name: {index.options.name}</Typography>
        <Typography>
          Fields:
          {
            <Box display="flex" gap={1} flexWrap="wrap">
              {index.fields.map((item: string, indexForChip: number) => (
                <Chip key={indexForChip} label={`${item}: ${index.types[indexForChip]}`} />
              ))}
            </Box>
          }
        </Typography>
        {index.options.unique === true && (
          <FormControlLabel control={<Checkbox checked={true} />} label="Unique" />
        )}
      </Box>
    </Card>
  );
};

export default IndexCard;
