export const passwordRegExp = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,16}$/;

export const usernameRegExp = /^[a-zA-Z0-9]([_-](?![_-])|[a-zA-Z0-9]){3,14}[a-zA-Z0-9]$/;

export const emailRegExp =
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;

export const phoneNumberRegExp = /^([+]?)[0-9]{4,12}$/;

export const noSpacesOrSpecialChars = /^(\d|\w)+[^\s]$/;

export const validFileName = /^[-\w^&'@{}[\],$=!#().%+~ ]+$/;
