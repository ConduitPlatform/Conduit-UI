import { AuthTeam, AuthUser } from '../models/AuthModels';

export const handleDeleteTeamMemberTitle = (multiple: boolean, user: AuthUser, team?: AuthTeam) => {
  if (multiple) {
    return `Remove selected users from the team ${team?.name}`;
  }
  return `Remove user ${user.email} from the team ${team?.name}`;
};

export const handleDeleteTeamMemberDescription = (
  multiple: boolean,
  user: AuthUser,
  team?: AuthTeam
) => {
  if (multiple) {
    return `Are you sure you want to remove the selected users from the team ${team?.name}?`;
  }
  return `Are you sure you want to remove ${user.email} from the team ${team?.name}?`;
};
