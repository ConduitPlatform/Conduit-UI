const getDeepValue = (object: any, array: any) =>
  array.reduce((objectItem: any, key: any) => {
    if (!objectItem) return;
    if (objectItem.type) return objectItem.type[key];
    return objectItem[key];
  }, object);

export default getDeepValue;
