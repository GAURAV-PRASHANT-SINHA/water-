const asyncHandler = require("express-async-handler");
require('dotenv').config();
const Stripe = require("stripe");
const Order = require("../models/Order.js");
const Product = require("../models/product.js");
const User = require("../models/User.js");
// const Coupon = require("../models/Coupon.js");

//@desc create orders
//@route POST /api/v1/orders
//@access private

//stripe instance
const stripe = new Stripe("sk_test_51QP341JvQeRJ5FkSyGaPzADamXBCK8q6mLWRuu5wPQLDMxEeDgPYWjfMc2u9ebQqjqQQq80RRSO2cq22bcQQe0Y800aFzZLaXb");

const createOrderCtrl = asyncHandler(async (req, res) => {
  // Get the payload (customer, orderItems, shippingAddress, totalPrice)
  const { orderItems, shippingAddress, totalPrice } = req.body;
  console.log(req.body);
  
  // Find the user
  const user = await User.findById(req.userAuthId);
  
  // Check if order is not empty
  if (orderItems?.length <= 0) {
    throw new Error("No Order Items");
  }

  // Place/create order - save into DB
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    totalPrice,
  });

  // Update the product quantity
  const products = await Product.find({ _id: { $in: orderItems } });
   
  orderItems?.forEach(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });

  // Push order into user
  user.orders.push(order?._id);
  await user.save();

  // Make payment (Stripe)
  // Convert order items to have same structure that Stripe needs
  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
      
    },
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.send({ url: session.url });
 
  
});

//@desc get all orders
//@route GET /api/v1/orders
//@access private

const getAllordersCtrl = asyncHandler(async (req, res) => {
  // Find all orders
  const orders = await Order.find().populate("user");
  res.json({
    success: true,
    message: "All orders",
    orders,
  });
});

//@desc get single order
//@route GET /api/v1/orders/:id
//@access private/admin

const getSingleOrderCtrl = asyncHandler(async (req, res) => {
  // Get the id from params
  const id = req.params.id;
  const order = await Order.findById(id);
  
  // Send response
  res.status(200).json({
    success: true,
    message: "Single order",
    order,
  });
});

//@desc update order to delivered
//@route PUT /api/v1/orders/update/:id
//@access private/admin

const updateOrderCtrl = asyncHandler(async (req, res) => {
  // Get the id from params
  const id = req.params.id;
  
  // Update
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  
  res.status(200).json({
    success: true,
    message: "Order updated",
    updatedOrder,
  });
});

// @desc get sales sum of orders
// @route GET /api/v1/orders/sales/sum
// @access private/admin

const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  // Get order stats
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: { $min: "$totalPrice" },
        totalSales: { $sum: "$totalPrice" },
        maxSale: { $max: "$totalPrice" },
        avgSale: { $avg: "$totalPrice" },
      },
    },
  ]);
  
  // Get the date
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: { createdAt: { $gte: today } },
    },
    {
      $group: { _id: null, totalSales: { $sum: "$totalPrice" } },
    },
  ]);
  
  // Send response
  res.status(200).json({
    success: true,
    message: "Sum of orders",
    orders,
    saleToday,
  });
});

module.exports = {
  createOrderCtrl,
  getAllordersCtrl,
  getSingleOrderCtrl,
  updateOrderCtrl,
  getOrderStatsCtrl,
};
