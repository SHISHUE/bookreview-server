const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const {otpVerificationTemplate} = require('../mail/emailVerificationTemplate')
require("dotenv").config();


//SendOtp
exports.sendOtp = async (req, res) => {
  try {
    // Email liya hai req. ki body se
    const { email } = req.body;

    // Email ko verify krenge ki phale se user hai y nahi
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    // OTP Generate krna hai ager user nhi hai toh

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // check krenge otp unique hai ya nahi
    let result = await OTP.findOne({ otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    // ab DB me entry krenge

    const otpPayload = { email, otp };
    let name = email.split('@')[0]
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    mailSender(email, "otp from Book review", otpVerificationTemplate(name, otp))

    return res.status(200).json({
      success: true,
      otp,
      message: "OTP Generated Successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Try again.",
      error: error.message
    });
  }
};


//signUp
exports.signUp = async (req, res) => {
  try {
    //phale to data fetch krna hai
    const {
      firstName,
      lastName,
      email,
      password,
      otp,
    } = req.body;

    //vaildtion krne hai

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !otp
      ) {
      return res.status(403).json({
        success: false,
        message: "All Fields Required.",
      });
    }


    //email verify krne hai user phale se to nahi h
    const userExists = await User.findOne({email});
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User exists please log in .",
      });
    }

    //find recent otp
    const otpFetch = await OTP.findOne({ email }).sort({ createdAt: -1 });
console.log(otpFetch);

// validate Otp
if (!otpFetch || otp !== otpFetch.otp) {
  return res.status(400).json({
    success: false,
    message: "OTP not correct.",
  });
}


    //password hasing

    const hashedPassword = await bcrypt.hash(password, 10);

    // DB me entry krnenge fir
    const user = await User.create({
      firstName,
      lastName,
      password: hashedPassword,
      email,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "user registed. ",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user not registrered try again.",
      data: error.message
    });
  }
};

//login
exports.login = async (req, res) => {
  try {
    // Email and password fetching
    const { email, password } = req.body;

    // Email validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all details",
      });
    }

    // User verification
    const userExistence = await User.findOne({ email });

    if (!userExistence) {
      return res.status(401).json({
        success: false,
        message: "Sign up kr le phale bhai.",
      });
    }

    // Password match
    if (await bcrypt.compare(password, userExistence.password)) {
      // Password decoding (JWT) and matching
      const secretKey = process.env.JWT_SECRET;
      const payload = {
        email: userExistence.email,
        id: userExistence._id,
      };

      const token = JWT.sign(payload, secretKey, { expiresIn: "24h" });

      // Update the user with the new token and remove the password
      userExistence.token = token;
      userExistence.password = undefined;

      // Create a cookie and send the response
      res
        .cookie("token", token, {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .status(200)
        .json({
          success: true,
          message: "Logged in successfully.",
          data: token,
          user: userExistence,
        });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is not correct",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Log in failed.",
      error: error.message,
    });
  }
};
