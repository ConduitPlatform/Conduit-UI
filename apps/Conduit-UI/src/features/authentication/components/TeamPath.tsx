import { Box, Collapse, IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';
import React, { FC } from 'react';
import { AuthTeam } from '../models/AuthModels';

interface Props {
  selectedTeam?: AuthTeam[];
  setSelectedTeam: (team?: AuthTeam[]) => void;
}

const TeamPath: FC<Props> = ({ selectedTeam, setSelectedTeam }) => {
  return (
    <Collapse in={selectedTeam && selectedTeam.length > 0}>
      <Box display="flex" alignItems="center" minHeight={32}>
        <Typography
          mr={2}
          color={'lightgray'}
          variant={'caption'}
          display={'flex'}
          alignItems={'center'}>
          <IconButton
            color={'inherit'}
            size={'small'}
            sx={{ marginLeft: -1 }}
            onClick={() => setSelectedTeam(undefined)}>
            <ClearIcon fontSize={'inherit'} />
          </IconButton>
          Selected Team:
        </Typography>
        {selectedTeam?.map((team, index, teams) => (
          <>
            <Typography
              key={'teamName' + index}
              variant={'body2'}
              onClick={() => setSelectedTeam(teams.slice(0, index + 1))}
              sx={{ cursor: 'pointer', fontWeight: index < teams.length - 1 ? 'normal' : 'bold' }}>
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
    </Collapse>
  );
};

export default TeamPath;
