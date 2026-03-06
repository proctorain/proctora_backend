// Catching errors from the individual codes
import HTTP_STATUS from '../utils/http.js';

const errorMiddleware = (err, req, res, next) => {
  console.error(`[Gateway Error] ${req.method} ${req.path}`, err.message);

  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: err.message || "Gateway error",
  });
};

export default errorMiddleware;