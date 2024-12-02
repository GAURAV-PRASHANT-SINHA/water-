const express = require('express');
const router = express.Router();
const Product = require('D:/minor/rminor/server/models/product');
const cloudinary = require('D:/minor/rminor/server/utils/cloudinary.js');
const upload = require('D:/minor/rminor/server/config/fileUpload.js')

// Async function to import p-limit dynamically
async function setupPLimit() {
  const pLimitModule = await import('p-limit');
  return pLimitModule.default(5); // Set the concurrency limit here, e.g., 5
}

// GET route to fetch all products
router.get('/', async (req, res) => {
    try {
        const productList = await Product.find();
        if (!productList || productList.length === 0) {
            return res.status(404).json({ success: false, message: "No products found" });
        }
        res.status(200).json({ success: true, data: productList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
const mongoose = require('mongoose');

router.put('/update/:id', upload.single('file'), async (req, res) => {
  console.log("Received PUT /update request");

  const { id } = req.params; // Get the product ID from the URL
  console.log(req.params.id);
  const { name, price, countInStock } = req.body;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  // Check if a file was uploaded
  let updatedImage = null;
  if (req.file) {
    updatedImage = req.file.path; // Get the uploaded image path
  }

  try {
    // Find the product by ID and update it
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: name || undefined, // Update only if provided
          price: price || undefined,
          countInStock: countInStock || undefined,
          image: updatedImage || undefined, // Update only if a file is uploaded
        },
      },
      { new: true } // Return the updated document
    );

    // Check if the product exists
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product: " + error.message });
  }
});

  

// POST route to add a new product
// POST route to add a new product
router.post('/create',upload.single('file'), async (req, res) => {
    const limit = await setupPLimit();  // Initialize pLimit inside the route handler
    console.log("Received POST /create request");
  
    // const imagesToUpload = req.body.images.map((imageUrl) => {
    //     return limit(async () => {
    //         try {
    //             // Upload the image from URL
    //             const result = await cloudinary.uploader.upload(imageUrl, {
    //                 fetch_format: "auto",   // Automatically select the best format
    //                 quality: "auto"         // Automatically select the best quality
    //             });
    //             console.log(`Successfully uploaded ${imageUrl}`);
    //             return result;
    //         } catch (error) {
    //             console.error("Cloudinary upload error:", error);  // Log upload error
    //             throw new Error("Cloudinary upload failed: " + error.message);
    //         }
    //     });
    // });
  
    try {
        // const uploadStatus = await Promise.all(imagesToUpload);
        // const imgUrls = uploadStatus.map((item) => item.secure_url);
  
        // if (!uploadStatus) {
        //     return res.status(500).json({
        //         error: "Images could not be uploaded!",
        //         status: false
        //     });
        // }
  
        const { name, price, countInStock } = req.body;
        const convertedImgs = req.file?.path;
        const newProduct = new Product({
            name,
            image: convertedImgs,  // Store the uploaded image URL(s)
         price,
        countInStock,
        });
  
        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, data: savedProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error creating product: " + error.message });
    }
  });
  
//   const mongoose = require('mongoose');

  router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params; // Get the product ID from the URL
  
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
  
    try {
      // Find the product by ID and delete it
      const deletedProduct = await Product.findByIdAndDelete(id);
  
      if (!deletedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: deletedProduct, // Optional: Return the deleted product details
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, message: "Error deleting product: " + error.message });
    }
  });
  
module.exports = router;