const homeRouter = require("./home");
const postRouter = require("./post");

function routes(app) {
  app.use("/", homeRouter);
  app.use("/:category", postRouter);
}

module.exports = routes;
