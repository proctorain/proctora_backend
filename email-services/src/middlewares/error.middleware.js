const errorMiddleware = (err, req, res, next) => {
  console.error("[Mail Service Error]", err.message);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Mail service error",
  });
};

export default errorMiddleware;
