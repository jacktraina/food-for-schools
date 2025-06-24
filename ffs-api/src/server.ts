import dotenv from "dotenv";
import path from "path";

// Load environment variables before importing anything else
// run sever, run client separately
//const envPath = path.resolve(__dirname, "../.env");
// run both client + server together
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

import "reflect-metadata";
import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { container } from "./config/container";
import { errorHandler } from "./interfaces/middleware/errorHandler";

import { HealthCheckController } from "./interfaces/controllers/HealthCheckController";
import { UserController } from "./interfaces/controllers/UserController";
import { TaskController } from "./interfaces/controllers/TaskController";
import { SchoolController } from "./interfaces/controllers/SchoolController";
import { DistrictController } from "./interfaces/controllers/DistrictController";
import { DashboardController } from "./interfaces/controllers/DashboardController";
import { OrganizationController } from "./interfaces/controllers/OrganizationController";
import { BidController } from "./interfaces/controllers/BidController";
import { BidItemController } from "./interfaces/controllers/BidItemController";
import { BidCategoryController } from "./interfaces/controllers/BidCategoryController";
import { VendorController } from "./interfaces/controllers/VendorController";
import { USDANewsController } from "./interfaces/controllers/USDANewsController";
import { setupSwagger } from "./swagger/swagger";

// import { RoleController } from "./interfaces/controllers/RoleController";

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Swagger docs
setupSwagger(app); // Temporarily commented out due to swagger.json file issue

// Use `container.get()` instead of `container.resolve()`
const healthCheckController = container.get<HealthCheckController>(HealthCheckController);
const userController = container.get<UserController>(UserController);
const taskController = container.get<TaskController>(TaskController);
const schoolController = container.get<SchoolController>(SchoolController);
const districtController = container.get<DistrictController>(DistrictController);
const dashboardController = container.get<DashboardController>(DashboardController);
const organizationController = container.get<OrganizationController>(OrganizationController);
const bidController = container.get<BidController>(BidController);
const bidItemController = container.get<BidItemController>(BidItemController);
const bidCategoryController = container.get<BidCategoryController>(BidCategoryController);
const vendorController = container.get<VendorController>(VendorController);
const usdaNewsController = container.get<USDANewsController>(USDANewsController);

app.use("/api/health", healthCheckController.getRouter());
app.use("/api/users", userController.getRouter());
app.use("/api/tasks", taskController.getRouter());
app.use("/api/schools", schoolController.getRouter());
app.use("/api/district", districtController.getRouter());
app.use("/api/dashboard", dashboardController.getRouter());
app.use("/api/organizations", organizationController.getRouter());
app.use("/api/bids", bidController.getRouter());
app.use("/api/bid-items", bidItemController.getRouter());
app.use("/api/bid-categories", bidCategoryController.getRouter());
app.use("/api/vendors", vendorController.getRouter());
app.use("/api/usda-news", usdaNewsController.getRouter());

app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`Swagger docs at http://localhost:${config.port}/api/docs`);
});
