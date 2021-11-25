export const sanitizeRequestParams = (obj: any) => {
  const keys = Object.keys(obj);
  if (keys.length) {
    keys.forEach((key) => {
      if (!obj[key] && obj[key] !== 0 && !(typeof obj[key] === 'boolean')) {
        delete obj[key];
      }
    });
  }
  return obj;
};
