export type LocalConfig = {
  local: {
    enabled: boolean;
    verification: {
      required: boolean;
      send_email: boolean;
      redirect_uri: string;
    };
    forgot_password_redirect_uri: string;
  };
};
