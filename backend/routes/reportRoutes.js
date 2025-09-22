import express from "express";
import {
  getApplicationStats,
  getDetailedApplicationReport,
  getReportFilters,
  exportReportPDF,
  exportReportExcel
} from "../controllers/reportController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Get application statistics and trends
router.get("/stats", isAuthenticated, getApplicationStats);

// Get detailed application report
router.get("/detailed", isAuthenticated, getDetailedApplicationReport);

// Get available filters for reports
router.get("/filters", isAuthenticated, getReportFilters);

// Export reports
router.get("/export/pdf", isAuthenticated, exportReportPDF);
router.get("/export/excel", isAuthenticated, exportReportExcel);

export default router;
