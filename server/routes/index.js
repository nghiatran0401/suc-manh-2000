const homeRouter = require("./home");
const postRouter = require("./post");
const searchRouter = require("./search");
const scriptRouter = require("./script");

function routes(app) {
  app.use("/", homeRouter);
  app.use("/search", searchRouter);
  app.use("/script", scriptRouter);
  app.use("/:category", postRouter);
}

module.exports = routes;
