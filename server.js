const express = require("express");
const dotenv = require("dotenv");
const fileupload = require("express-fileupload");
const path = require("path");
//loading env vars this should be kept at top
dotenv.config({ path: "./config/config.env" });

const bootcamp = require("./route/bootcamp");
const course = require("./route/course");
const mongooseDb = require("./db.js");
const errorLogger = require("./middleware/error");
const auth = require("./route/auth");
//custom made middleware
//const logger = require("./middleware/logger");

//cookie parser
const cookieParser = require("cookie-parser");

const morgan = require("morgan");

//Connection to db
mongooseDb();

const app = express();

// Static folder
app.use(express.static(path.join(__dirname, "public")));

//body parser
app.use(express.json());

app.use(morgan("dev"));

//File upload
app.use(fileupload());

//mount routers
app.use("/api/v1/bootcamps", bootcamp);
app.use("/api/v1/courses", course);
app.use("/api/v1/auth", auth);

//custom handler
app.use(errorLogger);
app.use(cookieParser);
const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Hi server is running in ${process.env.NODE_ENV} mode in port ${PORT}`
  )
);
// Handler for unhandled proise rejection

process.on("unhandledRejection", (err, promise) => {
  console.log(`Err: ${err.message}`);
  //close server and exit process
  server.close(() => process.exit(1));
});
