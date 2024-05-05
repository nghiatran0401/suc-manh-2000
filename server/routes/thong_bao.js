const express = require("express");

const thongBaoRouter = express.Router();

// Show a list of Thông báo
thongBaoRouter.get("/", (req, res) => {
  res.status(200).send({});
});

// Show a detailed page
thongBaoRouter.get("/:id", (req, res) => {
  res.status(200).send({});
});

module.exports = thongBaoRouter;
