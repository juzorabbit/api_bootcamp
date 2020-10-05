const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //creating copy of req params
  const reqQuery = { ...req.query };
  const removeField = ["select", "sort", "limit", "page"];
  removeField.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);

  //creating operators like $gte from gte passed in req.query
  let queryStr = JSON.stringify(reqQuery).replace(
    /\b(lte|lt|gte|gt|in)\b/g,
    (match) => `$${match}`
  );
  console.log(queryStr);
  query = model.find(JSON.parse(queryStr));

  //if populate present
  if (populate) {
    query = query.populate(populate);
  }

  //to filter a query based on select select parameter
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query.select(fields);
  }

  //sorting query based on sort parameter passed
  if (req.query.sort) {
    const fields = req.query.sort.split(",").join(" ");
    query.sort(fields);
  }

  //pagination
  /* we want the page from the request in number (base 10) with a default value 1 */
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query.skip(startIndex).limit(limit);
  const results = await query;

  //addidng response to get prev next info in pagination
  const pagination = {};
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    data: results,
    pagination,
  };
  next();
};

module.exports = advancedResults;
