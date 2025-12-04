import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const ENV = process.env.NODE_ENV || "development";

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://expense-steel.vercel.app",
      "https://expense-production-9137.up.railway.app",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(morgan(ENV === "development" ? "dev" : "combined"));

// Import routes AFTER environment variables are loaded
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import budgetRoutes from "./routes/budgetRoutes";
import aiRoutes from "./routes/aiRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import savingsRoutes from "./routes/savingsRoutes";
import recurringRoutes from "./routes/recurringRoutes";
import excelRoutes from "./routes/excelRoutes";
import transactionItemRoutes from "./routes/transactionItemRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { initCronJobs } from "./services/cronService";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";
import { apiLimiter, authLimiter } from "./middlewares/rateLimitMiddleware";

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Expense Tracker API",
    environment: ENV,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Apply global API rate limiter
app.use("/api", apiLimiter);

app.use("/api/users", authLimiter, authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transactions/:transactionId/items", transactionItemRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/export", excelRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Swagger Documentation
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Init Cron Jobs
initCronJobs();

app.use(notFound);
app.use(errorHandler);

// Async startup function with database connectivity check
async function startServer() {
  try {
    // Import Prisma after env is loaded
    const { prisma } = await import("./lib/prisma");

    // Test database connection
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Start the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on ${ENV} environment`);
      console.log(`✅ Listening on port ${PORT}`);
      console.log(`✅ Host: 0.0.0.0 (accessible from all network interfaces)`);
      console.log(`✅ Server is ready to accept connections`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  process.exit(1);
});

// Start the server
startServer();
