const express = require("express");

const gioiThieuRouter = express.Router();

gioiThieuRouter.get("/", (req, res) => {
  res.status(200).send({});
});

module.exports = gioiThieuRouter;
