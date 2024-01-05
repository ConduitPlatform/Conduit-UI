export type User = {
  _id: string
  email: string
  isVerified: boolean
}

export type Admin = {
  createdAt: string;
  email: string;
  username: string;
  updatedAt: string;
  _id: string;
  isSuperAdmin: boolean;
  hasTwoFA: boolean;
}