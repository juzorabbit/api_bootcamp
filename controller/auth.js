const User = require("../model/User");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../util/ErrorResponse");
const sendEmail = require("../util/mail");
const crypto = require("crypto");

// register users /api/v1/auth/register

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenAndResponse(user, res, 200);
});

// login users /api/v1/auth/login

exports.login = asyncHandler(async (req, res, next) => {
  //fetching values from request
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("400", `Please enter email and password`));
  }

  //+password is used because we had made select false in User.js model
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorResponse("400", `Invalid credentials`));
  }

  const validate = await user.matchPassword(password);
  if (!validate) {
    return next(new ErrorResponse("400", `Invalid credentials`));
  }
  sendTokenAndResponse(user, res, 200);
});

const sendTokenAndResponse = (user, res, statusCode) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//get me
//private ---- needs token to hit
exports.getMe = asyncHandler(async (req, res, next) => {
  const result = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: result });
});

// /auth/forgotpassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(
      new ErrorResponse(400, `There is no user in database with this email`)
    );
  }
  //get reset token
  const resetToken = user.getResetToken();
  await user.save({ validateBeforeSave: false });
  //create reset url
  console.log(resetToken);
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `Your forgot password. Please make put request to ${resetUrl}`;
  try {
    await sendEmail({
      to: req.body.email,
      subject: "reset password",
      message,
    });

    return res.status(200).json({ success: true, data: "email sent" });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    console.log(err);
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(500, `email could not be sent`));
  }
});

//resetPassword

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPassword = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  console.log(resetPassword);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    next(new ErrorResponse(400, `Token does not exist`));
  }
  user.password = req.body.password;
  console.log("pswd", user.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.save();
  sendTokenAndResponse(user, res, 200);
});
