const isNil = require('lodash/isNil');
const authHelper = require('../helpers/authHelper');
const moment = require('moment');
const emailProvider = require('@conduit/email');
const uuid = require('uuid/v4');
const TOKEN_TYPE = require('../constants/TokenType').TOKEN_TYPE;

async function register(req, res, next) {
  const {email, password} = req.body;
  const conduit = req.app.conduit;
  const database = conduit.database.getDbAdapter();
  const config = conduit.config.get('authentication');

  if (!config.local.active) return res.status(403).json({error: 'Local authentication is disabled'});
  if (isNil(email) || isNil(password)) return res.status(403).json({error: 'Email and password required'});

  const userModel = database.getSchema('User');
  const tokenModel = database.getSchema('Token');

  let user = await userModel.findOne({email});
  if (!isNil(user)) return res.status(403).json({error: 'User already exists'});

  const hashedPassword = await authHelper.hashPassword(password);
  user = await userModel.create({
    email,
    hashedPassword
  });

  if (config.local.sendVerificationEmail) {
    const verificationTokenDoc = await tokenModel.create({
      type: TOKEN_TYPE.VERIFICATION_TOKEN,
      userId: user._id,
      token: uuid()
    });
    // this will be completed when we build the email provider module
    // const link = `http://localhost:3000/authentication/verify-email/${verificationTokenDoc.token}`;
    // await emailProvider.sendMail({
    //   email: user.email,
    //   body: link,
    //   subject: 'test',
    //   sender: 'lakispapakis@mail.ml'
    // });
  }

  return res.json({message: 'Registration was successful'});
}

async function authenticate(req, res, next) {
  const {email, password} = req.body;
  const conduit = req.app.conduit;
  const database = conduit.database.getDbAdapter();
  const config = conduit.config.get('authentication');

  if (!config.local.active) return res.status(403).json({error: 'Local authentication is disabled'});
  if (isNil(email) || isNil(password)) return res.status(403).json({error: 'Email and password required'});

  const userModel = database.getSchema('User');
  const accessTokenModel = database.getSchema('AccessToken');
  const refreshTokenModel = database.getSchema('RefreshToken');

  const user = await userModel.findOne({email}, '+hashedPassword');
  if (isNil(user)) return res.status(401).json({error: 'Invalid login credentials'});
  if (!user.active) return res.status(403).json({error: 'Inactive user'});

  if (config.local.verificationRequired && !user.isVerified)
    return res.status(403).json({error: 'You must verify your account to login'});

  const passwordsMatch = await authHelper.checkPassword(password, user.hashedPassword);
  if (!passwordsMatch) return res.status(401).json({error: 'Invalid login credentials'});

  const accessToken = await accessTokenModel.create({
    userId: user._id,
    token: authHelper.encode({id: user._id}, { jwtSecret: config.jwtSecret, tokenInvalidationPeriod: config.tokenInvalidationPeriod}),
    expiresOn: moment().add(config.tokenInvalidationPeriod).format()
  });

  const refreshToken = await refreshTokenModel.create({
    userId: user._id,
    token: authHelper.generate(),
    expiresOn: moment().add(config.refreshTokenInvalidationPeriod).format()
  });

  return res.json({userId: user._id.toString(), accessToken: accessToken.token, refreshToken: refreshToken.token});
}

async function forgotPassword(req, res, next) {
  const email = req.body.email;
  const conduit = req.app.conduit;
  const database = conduit.database.getDbAdapter();
  const config = conduit.config.get('authentication');

  if (isNil(email)) res.status(401).json({error: 'Email field required'});

  const userModel = database.getSchema('User');
  const tokenModel = database.getSchema('Token');

  const user = await userModel.findOne({email});

  if (isNil(user) || (config.local.verificationRequired && !user.isVerified))
    return res.json({message: 'Ok'});

  const oldToken = await tokenModel.findOne({type: TOKEN_TYPE.PASSWORD_RESET_TOKEN, userId: user._id});
  if (!isNil(oldToken)) await oldToken.remove();

  const passwordResetTokenDoc = await tokenModel.create({
    type: TOKEN_TYPE.PASSWORD_RESET_TOKEN,
    userId: user._id,
    token: uuid()
  });

  // this will be completed when we build the email provider module

  // const link = `http://localhost:3000/authentication/reset-password/${passwordResetTokenDoc.token}`;
  // await emailProvider.sendMail({
  //   email: user.email,
  //   body: link
  // });

  return res.json({message: 'Ok'});
}

async function resetPassword(req, res, next) {
  const conduit = req.app.conduit;
  const database = conduit.database.getDbAdapter();

  const passwordResetTokenParam = req.body.passwordResetToken;
  const newPassword = req.body.password;
  if (isNil(newPassword) || isNil(passwordResetTokenParam)) {
    return res.status(401).json({error: 'Required fields are missing'});
  }

  const userModel = database.getSchema('User');
  const tokenModel = database.getSchema('Token');

  const passwordResetTokenDoc = await tokenModel.findOne({
    type: TOKEN_TYPE.PASSWORD_RESET_TOKEN,
    token: passwordResetTokenParam
  });
  if (isNil(passwordResetTokenDoc)) return res.status(401).json({error: 'Invalid parameters'});

  const user = await userModel.findOne({_id: passwordResetTokenDoc.userId}, '+hashedPassword');
  if (isNil(user)) return res.status(404).json({error: 'User not found'});

  const passwordsMatch = await authHelper.checkPassword(newPassword, user.hashedPassword);
  if (passwordsMatch) return res.status(401).json({error: "Password can't be the same as the old one"});

  user.hashedPassword = await authHelper.hashPassword(newPassword);
  await user.save();
  await passwordResetTokenDoc.remove();

  return res.json({message: 'Password reset successful'});
}

async function verifyEmail(req, res, next) {
  const verificationTokenParam = req.params.verificationToken;
  if (isNil(verificationTokenParam)) return res.status(401).json({error: 'Invalid parameters'});

  const database = req.app.conduit.database.getDbAdapter();
  const userModel = database.getSchema('User');
  const tokenModel = database.getSchema('Token');

  const verificationTokenDoc = await tokenModel.findOne({
    type: TOKEN_TYPE.VERIFICATION_TOKEN,
    token: verificationTokenParam
  });
  if (isNil(verificationTokenDoc)) return res.status(401).json({error: 'Invalid parameters'});

  const user = await userModel.findOne({_id: verificationTokenDoc.userId});
  if (isNil(user)) return res.status(404).json({error: 'User not found'});

  user.isVerified = true;
  await user.save();
  await verificationTokenDoc.remove();

  return res.json({message: 'Email verified'});
}

async function renewAuth(req, res, next) {
  const refreshToken = req.body.refreshToken;
  if (isNil(refreshToken))
    return res.status(401).json({error: 'Invalid parameters'});

  const conduit = req.app.conduit;
  const database = conduit.database.getDbAdapter();
  const config = conduit.config.get('authentication');

  const accessTokenModel = database.getSchema('AccessToken');
  const refreshTokenModel = database.getSchema('RefreshToken');

  // TODO Delete old access token with the same ClientId

  const oldRefreshToken = await refreshTokenModel.findOne({token: refreshToken});
  if (isNil(oldRefreshToken))
    return res.status(401).json({error: 'Invalid parameters'});

  const newAccessToken = await accessTokenModel.create({
    userId: oldRefreshToken.userId,
    token: authHelper.encode({id: oldRefreshToken.userId}, { jwtSecret: config.jwtSecret, tokenInvalidationPeriod: config.tokenInvalidationPeriod}),
    expiresOn: moment().add(config.tokenInvalidationPeriod).format()
  });

  const newRefreshToken = await refreshTokenModel.create({
    userId: oldRefreshToken.userId,
    token: authHelper.generate(),
    expiresOn: moment().add(config.refreshTokenInvalidationPeriod).format()
  });

  await oldRefreshToken.remove();

  return res.json({
    accessToken: newAccessToken.token,
    refreshToken: newRefreshToken.token
  });
}

async function logOut(req, res, next) {
  // TODO delete access and refresh tokens with the clientId
  return res.json({message: 'Logged out'});
}

module.exports.authenticate = authenticate;
module.exports.register = register;
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
module.exports.verifyEmail = verifyEmail;
module.exports.renewAuth = renewAuth;
module.exports.logOut = logOut;
