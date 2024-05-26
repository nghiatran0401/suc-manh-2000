function ErrorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const code = err?.statusCode || 500;
  res.status(code).send({
    statusCode: code,
    message: err?.message || "internal server error",
  });
}

class AppError extends Error {
  constructor(data) {
    super(data.message);
    this.name = "AppError";
    this.statusCode = data.statusCode || 500;
  }
}

module.exports = {
  ErrorMiddleware,
  AppError,
};
