export const sanitizeRequestParams = (obj: any) => {
  const keys = Object.keys(obj);
  if (keys.length) {
    keys.forEach((key) => {
      if (!obj[key] && obj[key] !== 0) {
        if (typeof obj[key] === 'boolean' && obj[key] !== null) {
          return;
        }
        delete obj[key];
      }
    });
  }
  return obj;
};
