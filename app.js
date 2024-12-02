require('dotenv').config();
const cors = require("cors");
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');
const userRoutes= require('./routes/usersRoute');
const ordersRouter = require("./routes/orderRouter.js");
const Stripe = require("stripe");

const app = express();
app.use(cors());
console.log("upd");



// Connect to the database using the CONNECTION_STRING from .env
mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the Product API');
});



const Order = require("./models/Order"); // Assuming you have an Order model

const stripe = new Stripe("sk_test_51QP341JvQeRJ5FkSyGaPzADamXBCK8q6mLWRuu5wPQLDMxEeDgPYWjfMc2u9ebQqjqQQq80RRSO2cq22bcQQe0Y800aFzZLaXb");

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_3cd794c14c5de21bbdde5481dd5175d6fabe49b987882dfe1d442bf86e310a44";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log("event");
    } catch (err) {
      console.log("err", err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      // Update the order
      console.log("everything is fine");
      const session = event.data.object;
      const { orderId } = session.metadata;
      const paymentStatus = session.payment_status;
      const paymentMethod = session.payment_method_types[0];
      const totalAmount = session.amount_total;
      const currency = session.currency;

      // Find and update the order
      try {
        const order = await Order.findByIdAndUpdate(
          JSON.parse(orderId),
          {
            totalPrice: totalAmount / 100,
            currency,
            paymentMethod,
            paymentStatus,
          },
          {
            new: true,
          }
        );
        console.log(order);
      } catch (err) {
        console.log("Order update error:", err.message);
      }
    } else {
      return;
    }

    response.status(200).send("Webhook received");
  }




);


// Middleware to parse JSON bodies
app.use(express.json());
// Use product routes
app.use("/api/orders",ordersRouter);
app.use('/api/products', productRoutes);
app.use("/api/users", userRoutes);

// Set the port for the server
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});