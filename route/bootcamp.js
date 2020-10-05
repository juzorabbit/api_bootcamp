const express = require("express");

const {
  getAllBootCamps,
  getSingleBootCamp,
  UpdateBootCamp,
  DeleteBootCamp,
  CreateBootCamp,
  FindBootCampWithRadius,
  UpdatePhoto,
} = require("../controller/bootcamp");
const advancedResults = require("../middleware/advancedResults");
const { protect } = require("../middleware/auth");

const Bootcamps = require("../model/Bootcamp");
// requiring another resource router
const course = require("./course");

const router = express.Router();

//re-routing :bootcampId/courses
router.use("/:bootcampId/courses", course);
router.route("/:id/photo").put(protect, UpdatePhoto);
router.route("/radius/:zipcode/:distance").get(FindBootCampWithRadius);
//we are using advanced Results middleware for getAllBootCamps
router
  .route("/")
  .get(advancedResults(Bootcamps), getAllBootCamps)
  .post(protect, CreateBootCamp);
router
  .route("/:id")
  .put(protect, UpdateBootCamp)
  .delete(protect, DeleteBootCamp)
  .get(getSingleBootCamp);

module.exports = router;
