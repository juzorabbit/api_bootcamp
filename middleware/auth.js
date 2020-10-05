const User = require("../model/User");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../util/ErrorResponse");
const jwt = require("jsonwebtoken");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    //make sure token exists
    if (!token) {
      return next(new ErrorResponse(401, `Unauthorised access to the route`));
    }
    //extracting token
    try {
      //
      const decoder = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoder.id);
      console.log("user", req.user.id);
      next();
    } catch (err) {
      return next(new ErrorResponse(401, `Unauthorised access to this route`));
    }
  } else {
    return next(new ErrorResponse(401, `Unauthorised access to this route`));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          403,
          `${req.user.role} doesn't have access to this route`
        )
      );
    }
    next();
  };
};
