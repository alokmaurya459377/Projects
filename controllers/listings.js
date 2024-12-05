const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// index
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}
 
// renderNewForm
module.exports.renderNewForm =  (req, res) => {
  res.render("listings/create.ejs");
}

// showListing
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listings = await Listing.findById(id).populate({ 
    path: "reviews", populate: { path: "author" } 
  }).populate("owner");
  if(!listings){
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listings });
}
 
// createListing
module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
  .send()

  let filename = req.file.filename;
  let url = req.file.path;
  let listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing.owner = req.user._id;

  newListing.geometry = response.body.features[0].geometry;

  newListing.image = {url, filename};
  let savedListing = await newListing.save();
  // console.log(savedListing);
  req.flash("success", "New Listing Created!!");
  res.redirect("/listings");
}

// renderEditForm
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
}

// updateListing
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file !== "undefined") {
    let filename = req.file.filename;
    let url = req.file.path;
    listing.image = {url, filename};
    await listing.save();
  }
  req.flash("success", "Listing Updated!!");
  res.redirect(`/listings/${id}`);
}

// destroyListing
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!!");
  res.redirect("/listings");
}