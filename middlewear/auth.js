const jwt = require("jsonwebtoken");
require("dotenv").config();
//auth
exports.auth = async (req, res, next) => {
  try {
    console.log("BEFORE TOKEN EXTRACTION ");
    console.log("After TOKEN EXTRACTION ", req.cookies, req.body, req.header); 
    // Token extraction
    var token =
      req.cookies.token ||
      req.body.token ||
      req.header('Authorization')?.replace('Bearer ', ''); 


    // If token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // Verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Something is not looking right while validating the ${token}`,
      error: error.message
    });
  }
};
