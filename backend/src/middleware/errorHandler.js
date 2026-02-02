function normalizeError(err) {
  const status = err.status || err.statusCode || 500;

  const code =
    err.code ||
    (status === 400 ? "BAD_REQUEST" :
     status === 404 ? "NOT_FOUND" :
     status === 401 ? "UNAUTHORIZED" :
     status === 403 ? "FORBIDDEN" :
     "INTERNAL_SERVER_ERROR");

  const message =
    status >= 500
      ? "Internal server error"
      : (err.message || "Request failed");

  return { status, code, message };
}

function errorHandler(err, req, res, next) {
  const { status, code, message } = normalizeError(err);

  const isProd = process.env.NODE_ENV === "production";

  if (!isProd || status >= 500) {
    console.error("ERROR:", {
      code,
      status,
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method
    });
  }

  res.status(status).json({
    error: {
      code,
      message
    }
  });
}

module.exports = { errorHandler };
