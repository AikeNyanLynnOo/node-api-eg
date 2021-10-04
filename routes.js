const express = require("express");
const router = express.Router();

const mongojs = require("mongojs");
const db = mongojs("travel", ["records"]);

router.get("/people", (req, res) => {
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

router.get("/people/:id", (req, res) => {});

router.get("/test", (req, res) => {
  return res.json(req.query);
});

module.exports = router;
