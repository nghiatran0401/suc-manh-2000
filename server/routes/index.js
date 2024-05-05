const homeRouter = require("./home");
const gioiThieuRouter = require("./gioi_thieu");
const thongBaoRouter = require("./thong_bao");
const duAn2024Router = require("./du_an_2024");

function routes(app) {
  app.use("/", homeRouter);
  app.use("/gioi-thieu", gioiThieuRouter);
  app.use("/thong-bao", thongBaoRouter);
  app.use("/du-an-2024", duAn2024Router);
}

module.exports = routes;
