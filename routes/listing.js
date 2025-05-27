const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const methodOverride = require("method-override");
const {isLoggedIn,isOwner,validateListing}=require("../views/middleware.js");

const listingController=require("../controllers/listings.js");
const multer  = require('multer')  //multer is a middleware used for handling multipart form data which is primarily used for uploading files
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage })

//we have merged both index route as well as create route because they had the same path "/"
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing)
);



//New route
router.get("/new",isLoggedIn,listingController.renderNewForm) 


// GET /search?query=searchTerm
router.get('/search', async (req, res) => {
  const query = req.query.query;

  try {
    // Case-insensitive partial match on 'title'
    const listings = await Listing.find({
      title: { $regex: query, $options: 'i' }
    });

    // Render search results page
    res.render('includes/searchResults', { listings, query });

  } catch (err) {
    res.status(500).send('Error while searching: ' + err.message);
  }
});


//we have merged show route and update and delete route as they had the same route /:id
router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn ,isOwner,wrapAsync(listingController.destroyListing))

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));




module.exports=router;