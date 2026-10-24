/** Public, non-secret realm info carried on Team documents (absent on older backends). */
export type RealmPublic = {
  enabled: boolean;
  slug?: string;
};

export type Team = {
  _id: string;
  name: string;
  parentTeam: string;
  isDefault: boolean;
  realm?: RealmPublic;
  createdAt: string;
  updatedAt: string;
};
