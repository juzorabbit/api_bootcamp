const logger = (req, res, next) => {
  console.log("middlewarre");
  req.Hello = "hello";
  next();
};

module.exports = logger;
