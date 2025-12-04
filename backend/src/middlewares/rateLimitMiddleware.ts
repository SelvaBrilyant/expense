import rateLimit from "express-rate-limit";

// Skip rate limiting for localhost in development
const skipLocalhost = (req: any) => {
  if (process.env.NODE_ENV === "development") {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
  }
  return false;
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: skipLocalhost,
  message: {
    status: "error",
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (reduced from 1 hour for better UX)
  max: 50, // Limit each IP to 50 login/register requests per 15 minutes (increased from 10)
  skip: skipLocalhost, // Skip for localhost in development
  message: {
    status: "error",
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
});
