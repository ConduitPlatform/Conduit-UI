import { AuthTeam } from '../models/AuthModels';
export const handleDeleteTeamTitle = (team: AuthTeam) => {
  return `Delete team ${team.name}`;
};

export const handleDeleteTeamDescription = (team: AuthTeam) => {
  return `Are you sure you want to delete ${team.name}?`;
};
