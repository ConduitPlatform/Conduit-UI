export const getErrorData = (errorProp: any) => {
  if (!errorProp) {
    return;
  }

  const { details, message } = errorProp.data;
  const { error, status } = errorProp;

  const detailsFound = details !== '' && details !== null && details !== undefined;
  const errorFound = error !== '' && error !== null && error !== undefined;
  const statusFound = status !== '' && status !== null && status !== undefined;
  const messageFound = message !== '' && message !== null && message !== undefined;

  if (!detailsFound && !errorFound && !statusFound && !messageFound) {
    return 'An unexpected error happened!';
  } else
    return `${detailsFound ? details : ''} ${errorFound ? error : ''} ${
      messageFound ? message : ''
    } ${statusFound ? status : ''}`;
};
