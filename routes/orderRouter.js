const express = require("express");
const {
  createOrderCtrl,
  getAllordersCtrl,
  getOrderStatsCtrl,
  updateOrderCtrl,
  getSingleOrderCtrl,
  
} = require("../controllers/orderCtrl.js");

const  isLo = require("../middlewares/isLoggedIn.js");

const ordersRouter = express.Router();

ordersRouter.post("/post", isLo,createOrderCtrl);
ordersRouter.get("/getit", getAllordersCtrl);
ordersRouter.get("/sales/stats", getOrderStatsCtrl);
ordersRouter.put("/update/:id", updateOrderCtrl);
ordersRouter.get("/:id",   getSingleOrderCtrl);

module.exports = ordersRouter;
