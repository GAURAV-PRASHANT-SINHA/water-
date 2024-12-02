const jwt = require("jsonwebtoken");

const isLo = (req, res, next) => {
  // Get token from header
  const token = req?.headers?.authorization?.split(" ")[1];

  if (token === undefined) {
    return res.status(401).json({ error: "No token found in the header" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid/Expired token, please login again" });
    } else {
      // Save the user into req object
      req.userAuthId = decoded.id;
      next();
    }
  });
};

module.exports = isLo;
