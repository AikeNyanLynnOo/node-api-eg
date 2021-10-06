// Dotenv
require("dotenv").config();

// JWT
const jwt = require("jsonwebtoken");
const secret = process.env.secret;

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.sendStatus(401);

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") return res.sendStatus(401);
  jwt.verify(token, secret, (err, data) => {
    if (err) return res.sendStatus(401);
    else next();
  });
};

const adminOnly = (req, res, next) => {
  const [type, token] = req.headers["authorization"].split(" ");
  jwt.verify(token, secret, (err, user) => {
    if (user.role === "admin") next();
    else return res.sendStatus(403);
  });
};

module.exports = { auth, adminOnly };
