const Bootcamp = require("../model/Bootcamp");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../util/geocoder");
const ErrorResponse = require("../util/ErrorResponse");
const path = require("path");

exports.getAllBootCamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

exports.getSingleBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // since we have two res.send in a single scope of try, we will get error as headers being already declared.
    //hence requires return at first statement.Err: Can't set headers after they are sent.
    return next(err);
  }

  res.status(200).json({ scuccess: true, data: bootcamp });
});

exports.CreateBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ scuccess: true, msg: "create bootcamp", bootcamp });
});

exports.UpdateBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    // since we have two res.send in a single scope of try, we will get error as headers being already declared.
    //hence requires return at first statement.Err: Can't set headers after they are sent.
    return res.status(400).json({ scuccess: false });
  }

  res.status(200).json({ scuccess: true, data: bootcamp });
});

//this is left unchanged for remebering try catch way ie w/o asyncHandler  middleware

exports.DeleteBootCamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      // since we have two res.send in a single scope of try, we will get error as headers being already declared.
      //hence requires return at first statement.Err: Can't set headers after they are sent.
      return res.status(400).json({ scuccess: false });
    }

    res.status(200).json({ scuccess: true, data: bootcamp });
  } catch (error) {
    next(err);
  }
};

exports.FindBootCampWithRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  //dividing distance by radius of earth in miles to get radius
  const radius = distance / 3963;
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });
  res.status(200).json({ scuccess: true, data: bootcamps });
});

//photo upload
//route: /:id/photo

exports.UpdatePhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(400, `The id was not correct`));
  }
  if (!req.files) {
    return next(new ErrorResponse(400, `Please upload a file`));
  }
  const file = req.files.file;
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(400, `Please upload an image`));
  }

  // if (file.size > process.env.FILE_SIZE) {
  //   return next(
  //     new ErrorResponse(
  //       400,
  //       `Please upload an image of size less than ${process.env.FILE_SIZE}`
  //     )
  //   );
  // }
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(500, `unable to upload file`));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
