const homeRouter = require("./home");
const postRouter = require("./post");
const searchRouter = require("./search");

function routes(app) {
  app.use("/", homeRouter);
  app.use("/search", searchRouter);
  app.use("/:category", postRouter);
}

module.exports = routes;
