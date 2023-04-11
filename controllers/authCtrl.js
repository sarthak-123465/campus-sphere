const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const authCtrl = {
  register: async (req, res) => {
    try {
      const { fullname, username, email, password, gender } = req.body;

      let newUserName = username.toLowerCase().replace(/ /g, "");

      const user_name = await Users.findOne({ username: newUserName });
      if (user_name) {
        return res.status(400).json({ msg: "This username is already taken." });
      }

      const user_email = await Users.findOne({ email });
      if (user_email) {
        return res
          .status(400)
          .json({ msg: "This email is already registered." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long." });
      }
      
      const passwordHash = await bcrypt.hash(password, 12);
      
      const newUser = new Users({
        fullname,
        username: newUserName,
        email,
        password: passwordHash,
        gender
      });
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });

      const token = createAccessToken({ id: newUser._id });

      const baseUrl = process.env.DEPLOY_URL || 'http://localhost:3000'

      const mailConfigurations = {
  
        from: process.env.EMAIL,    
        to: email,
        subject: 'Email Verification',
        text: `Hi! There, You have recently visited 
our website and entered your email.
Please follow the given link to verify your email
${baseUrl}/verify/${token}
Thanks`
          
      }

      transporter.sendMail(mailConfigurations, function(error, info){
        if (error) throw Error(error);
        console.log('Email Sent Successfully');
      });

      await newUser.save();

      res.status(200).json({ msg: "registered" });
    } catch (err) {
      console.log(err)
      return res.status(500).json({ msg: err.message });
    }
  },
  verify: async (req, res) => {
    const {token} = req.params;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.send("Email verification failed, possibly the link is invalid or expired");
      }
      else {
        console.log(decoded.id)
        const user = await Users.findOne({_id: decoded.id})
        user.confirmed = true
        await user.save()
        res.send("Email verified successfully!");
      }
    });
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await Users.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ msg: "This email is not registered." });
      }
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });

      const token = createAccessToken({ id: user._id });

      const baseUrl = process.env.DEPLOY_URL || 'http://localhost:3000'

      const mailConfigurations = {
  
        from: process.env.EMAIL,    
        to: email,
        subject: 'Reset Password',
        text: `Hi! There, you have sent a request
to reset your password.
Please follow the given link to set a new password
${baseUrl}/resetPassword/${token}
Thanks`
          
      }

      transporter.sendMail(mailConfigurations, function(error, info){
        if (error) throw Error(error);
        console.log('Email Sent Successfully');
      });

      res.status(200).json({ msg: "Email sent" });
    } catch (err) {
      console.log(err)
      return res.status(500).json({ msg: err.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const {password, cf_password} = req.body;

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      
      const {token} = req.params;

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
          console.log(err);
          res.send("Could not reset password, please try again");
        }
        else {
          const user = await Users.findOne({_id: decoded.id})
          user.password = passwordHash
          await user.save()
          res.send("New password has been set successfully!");
        }
      });

    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  registerAdmin: async (req, res) => {
    try {
      const { fullname, username, email, password, gender, role } = req.body;

      let newUserName = username.toLowerCase().replace(/ /g, "");

      const user_name = await Users.findOne({ username: newUserName });
      if (user_name) {
        return res.status(400).json({ msg: "This username is already taken." });
      }

      const user_email = await Users.findOne({ email });
      if (user_email) {
        return res
          .status(400)
          .json({ msg: "This email is already registered." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long." });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = new Users({
        fullname,
        username: newUserName,
        email,
        password: passwordHash,
        gender,
        role
      });




      await newUser.save();

      res.json({ msg: "Admin Registered Successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email, role: "user" }).populate(
        "followers following",
        "-password"
      );

      if (!user) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      if (!user.confirmed) {
        return res.status(400).json({ msg: "You must verify your Email first." });
      }

      const access_token = createAccessToken({ id: user._id });
      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, //validity of 30 days
      });

      res.json({
        msg: "Logged in  Successfully!",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  adminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email, role: "admin" });

      if (!user) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      const access_token = createAccessToken({ id: user._id });
      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, //validity of 30 days
      });

      res.json({
        msg: "Logged in  Successfully!",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ msg: "Logged out Successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  generateAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;

      if (!rf_token) {
        return res.status(400).json({ msg: "Please login again." });
      }
      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) {
          return  res.status(400).json({ msg: "Please login again." });
          }

          const user = await Users.findById(result.id)
            .select("-password")
            .populate("followers following", "-password");

          if (!user) {
          return  res.status(400).json({ msg: "User does not exist." });
          }

          const access_token = createAccessToken({ id: result.id });
          res.json({ access_token, user });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const decodeToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = authCtrl;
