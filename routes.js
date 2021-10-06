// Dotenv
require("dotenv").config();

// Express
const express = require("express");
const router = express.Router();

// Mongo
const mongojs = require("mongojs");
const db = mongojs("travel", ["records"]);

// Express-validatior
const { body, param, validationResult } = require("express-validator");

// JWT
const jwt = require("jsonwebtoken");
const secret = process.env.secret;

// Middlewares
const { auth, adminOnly } = require("./middlewares");

// Custom variables
const users = [
  { username: "Alice", password: "password", role: "admin" },
  { username: "Bob", password: "password", role: "user" },
];

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (user, index) => user.username === username && user.password === password
  );
  if (user) {
    jwt.sign(user, secret, { expiresIn: "1h" }, (err, token) => {
      return res.status(200).json({ token });
    });
  } else {
    return res.sendStatus(401);
  }
});

// Creating using POST method
router.post(
  "/records",
  [
    body("name").not().isEmpty(),
    body("from").not().isEmpty(),
    body("to").not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    db.records.insert(req.body, (err, data) => {
      if (err) {
        res.status(500).json({ err });
      }
      const _id = data._id;
      res.append("Location", "/api/records/" + _id);
      return res.sendStatus(201);
    });
  }
);

// Creating using PUT method
router.put("/records", [body("name").not().isEmpty()], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  db.records.save(req.body, (err, data) => {
    if (err) {
      return res.status(500).json({ err });
    }
    const _id = data._id;
    res.append("Location", "/api/records/" + _id);
    return res.sendStatus(201);
  });
});

// Reading data with filter
router.get("/people", auth, (req, res) => {
  const options = req.query;
  const sort = options.sort || {};
  const filter = options.filter || {};
  const limit = 10;
  const page = parseInt(options.page) || 1;
  const skip = (page - 1) * limit;

  for (i in sort) {
    sort[i] = parseInt(sort[i]);
  }

  db.records
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit, (err, docs) => {
      if (!err) {
        return res.status(200).json({
          meta: {
            sort,
            filter,
            limit,
            page,
            skip,
            length: docs.length,
          },
          data: docs,
          links: {
            self: req.originalUrl,
            // prev and next links are good to inserted
          },
        });
      } else {
        //   return res.status(500).end(); // first menthod
        return res.sendStatus(500);
      }
    });
});

// Reading with ID
router.get("/people/:id", (req, res) => {});

// Updating with ID using PUT method
router.put(
  "/records/:id",
  [param("id").isMongoId(), body("name").not().isEmpty()],
  (req, res) => {
    const _id = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    db.records.count({ _id: mongojs.ObjectId(_id) }, (err, count) => {
      if (count) {
        const updateRecord = { _id: mongojs.ObjectId(_id), ...req.body };
        db.records.save(updateRecord, (err, data) => {
          if (err) {
            return res.status(500).json({ err });
          }
          return res.status(200).json({ meta: { _id }, data });
        });
      } else {
        return res.status(404).json({ err });
      }
    });
  }
);

// Updating with ID using PATCH method
router.patch("/records/:id", [param("id").isMongoId()], (req, res) => {
  const _id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.records.count({ _id: mongojs.ObjectId(_id) }, (err, count) => {
    if (count) {
      db.records.update(
        { _id: mongojs.ObjectID(_id) },
        { $set: req.body },
        { multi: false },
        (err, data) => {
          if (err) {
            return res.status(500).json({ err });
          }
          db.records.find({ _id: mongojs.ObjectID(_id) }, (err, data) => {
            if (err) {
              return res.status(404).json({ err });
            }
            return res.status(200).json({ meta: { _id }, data });
          });
        }
      );
    }
  });
});

// Updating multiple with query filter
router.patch("/records", [body("name").not().isEmpty()], (req, res) => {
  const options = req.query;
  const filter = options.filter || {};
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.records.count(filter, (err, count) => {
    if (count) {
      db.records.update(
        filter,
        { $set: req.body },
        { multi: true },
        (err, data) => {
          if (err) {
            return res.status(500).json({ err });
          }
          const found = data.n;
          const modified = data.nModified;
          const ok = data.ok;
          db.records.find(req.body, (err, data) => {
            if (err) {
              return res.status(500).json({ err });
            }
            return res.status(200).json({
              meta: { found, modified, ok },
              data,
            });
          });
        }
      );
    }
  });
});

// Deleting with ID
router.delete(
  "/records/:id",
  auth,
  adminOnly,
  [param("id").isMongoId()],
  (req, res) => {
    const _id = req.params.id;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    db.records.count({ _id: mongojs.ObjectId(_id) }, (err, count) => {
      if (count) {
        db.records.remove({ _id: mongojs.ObjectId(_id) }, (err, data) => {
          return res.sendStatus(204);
        });
      } else {
        return res.sendStatus(404);
      }
    });
  }
);

router.patch("/records", []);

router.get("/test", (req, res) => {
  return res.json(req.query);
});

module.exports = router;
