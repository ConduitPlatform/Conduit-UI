import { Box, IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';
import React, { FC } from 'react';
import { AuthTeam } from '../models/AuthModels';

interface Props {
  selectedTeam?: AuthTeam[];
  setSelectedTeam: (team?: AuthTeam[]) => void;
}

const TeamPath: FC<Props> = ({ selectedTeam, setSelectedTeam }) => {
  if (!selectedTeam || !selectedTeam.length) return null;
  return (
    <Box display="flex" alignItems="center">
      <Typography mr={2} color={'lightgray'} variant={'caption'}>
        <IconButton color={'inherit'} size={'small'} onClick={() => setSelectedTeam(undefined)}>
          <ClearIcon fontSize={'inherit'} />
        </IconButton>
        Selected Team:
      </Typography>
      {selectedTeam?.map((team, index, teams) => (
        <>
          <Typography
            key={'teamName' + index}
            variant={index < teams.length - 1 ? 'caption' : 'h6'}
            onClick={() => setSelectedTeam(teams.slice(0, index + 1))}
            sx={{ cursor: 'pointer' }}>
            {team.name}
          </Typography>
          {index < teams.length - 1 && (
            <Typography key={'divider' + index} color={'primary'} variant={'h6'}>
              /
            </Typography>
          )}
        </>
      ))}
    </Box>
  );
};

export default TeamPath;
