import { AuthTeam } from '../models/AuthModels';
export const handleDeleteTitle = (team: AuthTeam) => {
  return `Delete team ${team.name}`;
};

export const handleDeleteDescription = (team: AuthTeam) => {
  return `Are you sure you want to delete ${team.name}?`;
};
