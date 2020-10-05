const ErrorResponse = require("../util/ErrorResponse");

const errorhandler = (err, req, res, next) => {
  let error = { ...err };
  err.message = err.message;
  //console log for dev
  console.log(err.stack);
  if (err.name == "CastError") {
    error = new ErrorResponse(
      404,
      `This is from errorHAndling1 hahaha  cannot find file with id ${err.value}`
    );
  }
  res
    .status(error.statusCode || 404)
    .json({ success: false, message: err.message });
};

module.exports = errorhandler;
