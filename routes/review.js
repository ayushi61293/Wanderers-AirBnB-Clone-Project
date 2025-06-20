const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../views/middleware.js");

const reviewController = require("../controllers/review.js");
const review = require("../models/review.js");
//Reviews
//post route
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewController.createReview));

//DELETE ROUTE
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;