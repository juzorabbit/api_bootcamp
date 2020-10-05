const express = require("express");
const { getAllCourse } = require("../controller/course");

const router = express.Router({ mergeParams: true });
console.log("inside route");
router.route("/").get(getAllCourse);

module.exports = router;
