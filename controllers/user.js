const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_KEY } = process.env;
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const { REFRESH_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI } =
  process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ where: { email } });
    const correct = await bcrypt.compare(password, findUser.password);

    if (!findUser || !correct) {
      return res.status(404).json({
        status: false,
        message: "email or password not correct",
        data: null,
      });
    }

    // JWT_KEY
    const payload = {
      id: findUser.id,
      name: findUser.name,
      email: findUser.email,
    };
    const token = jwt.sign(payload, JWT_KEY);

    return res.status(200).json({
      status: true,
      message: "login success",
      data: token,
    });
  } catch (err) {
    if (err.message == "Cannot read properties of null (reading 'password')") {
      return res.status(404).json({
        status: false,
        message: "do you already register?",
        data: null,
      });
    }
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    console.log(email)
    const findUser = await User.findOne({ where: { email } });

    if (!findUser) {
      res.status(401).json({
        status: false,
        message: "email not found!",
      });
    }

    const payload = {
      id: findUser.id,
      email: findUser.email,
    };

    const token = jwt.sign(payload, JWT_KEY);

    const accessToken = await oauth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "dedensetyawan17@gmail.com",
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      to: findUser.email,
      subject: "Reset Password",
      html: `<p>http://localhost:3000/reset-password-page?token=${token}</p>`,
    };

    const response = await transport.sendMail(mailOptions);

    return res.status(200).json({
      status: true,
      message: "success",
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

let token = ''

const resetPassword = async (req, res, next) => {
  try {
    const { newPass, confirmNewPass } = req.body;

    console.log(token)
    const validUser = jwt.verify(token, JWT_KEY);

    if (!validUser) {
      return res.status(401).json({
        status: false,
        message: "invalid token",
      });
    }

    const findUser = await User.findOne({ where: { id: validUser.id } });

    if (newPass !== confirmNewPass) {
      return res.status(401).json({
        status: false,
        message: "password not match",
      });
    }

    const encryptedPass = await bcrypt.hash(newPass, 10);

    await User.update(
      { password: encryptedPass },
      { where: { id: findUser.id } }
    );

    return res.status(201).json({
      status: true,
      message: "success change password",
      data: {
        id: findUser.id,
        username: findUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

const forgotPasswordPage = (req, res) => {
  res.render("forgot-password")
}

const resetPasswordPage = (req, res) => {
  token = req.query.token
  res.render('reset-password')
}

module.exports = { login, forgotPassword, resetPassword, forgotPasswordPage, resetPasswordPage };
