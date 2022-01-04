export const getPasswordStrength = (password: string) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
  const mediumRegex =
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))(?=.{6,})/;

  const weakRegex = /^(?=.{5,})/;

  if (strongRegex.test(password)) {
    return 3;
  }
  if (mediumRegex.test(password)) {
    return 2;
  }
  if (weakRegex.test(password)) {
    return 1;
  }
  return 0;
};
