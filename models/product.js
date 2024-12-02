const mongoose = require("mongoose");

// Define the product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: [{
        type: String,
        required: true
    }],
    price: {
        type: Number,
        default: 0
    },
    countInStock: {
        type: Number,
        required: true
    },
    totalSold: {
        type: Number,
        required: true,
        default: 0,
      },

},
{
    toJSON: { virtuals: true },
}

);

productSchema.virtual("qtyLeft").get(function () {
    const product = this;
    return product.countInStock - product.totalSold;
  });

// Define and export the Product model
module.exports = mongoose.model('Product', productSchema);
