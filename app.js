require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const express = require("express");
const router = require("./routes");
const ejs = require("ejs");
const bodyParser = require('body-parser')

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(router);

app.listen(PORT, () => {
  console.log(`nodemailerProject is listening at http://localhost:${PORT}`);
});
