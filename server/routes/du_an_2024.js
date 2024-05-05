const express = require("express");

const duAn2024Router = express.Router();

// Show a list of Dự án 2024
duAn2024Router.get("/", (req, res) => {
  res.status(200).send({});
});

// Show a detailed page
duAn2024Router.get("/:id", (req, res) => {
  res.status(200).send({});
});

module.exports = duAn2024Router;
