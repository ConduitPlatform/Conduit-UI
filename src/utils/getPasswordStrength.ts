export const getPasswordStrength = (password: string) => {
  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
  const mediumRegex = new RegExp(
    '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})'
  );
  const weakRegex = new RegExp('^(?=.{5,})');

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
