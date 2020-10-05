const Courses = require("../model/Course");
const asyncHandler = require("../middleware/asyncHandler");

//get all courses or a course with specific bootcamp id
//@route / and /:bootcampId

exports.getAllCourse = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Courses.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Courses.find();
  }
  const courses = await query;
  res.status(200).json({ success: true, count: courses.length, data: courses });
});
