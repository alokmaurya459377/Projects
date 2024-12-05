const Listing = require("../models/listing");
const Review = require("../models/review.js");

// createReview
module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("data was save");
  req.flash("success", "New Reviews Created!!");``
  res.redirect(`/listings/${id}`);
}

// destroyReview
module.exports.destroyReview =  async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!!");
  res.redirect(`/listings/${id}`);
}