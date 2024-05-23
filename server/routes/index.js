const homeRouter = require("./home");
const postRouter = require("./post");

function routes(app) {
  app.use("/:category", postRouter);
  app.use("/", homeRouter);
}

module.exports = routes;
