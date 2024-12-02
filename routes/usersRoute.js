const express = require("express");
const {
  registerUserCtrl,
  loginUserCtrl,
  getUserProfileCtrl,
  updateShippingAddresctrl,
} = require("../controllers/usersCtrl.js");
const isLo  = require("../middlewares/isLoggedIn.js");

const userRoutes = express.Router();

userRoutes.post("/register", registerUserCtrl);
userRoutes.post("/login", loginUserCtrl);
userRoutes.get("/profile", isLo, getUserProfileCtrl);
userRoutes.put("/update/shipping", isLo, updateShippingAddresctrl);

module.exports = userRoutes;
