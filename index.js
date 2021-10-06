// Dotenv
require('dotenv').config();

// Express
const express = require("express");
const app = express();

// bodyParser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

// CORS
const cors = require("cors");

// Routes
const routes = require("./routes");

// variables
const PORT = 8000;

// app.use(function (req, res, next) {
//   res.append("Access-Control-Allow-Origin", "*");
//   res.append("Access-Control-Allow-Methods", "*");
//   res.append("Access-Control-Allow-Headers", "*");
//   next();
// });

app.use(cors()); // allow all

app.use("/api",routes);

app.listen(PORT, () => {
  console.log(`Servers is runnng at port ${PORT}`);
});
