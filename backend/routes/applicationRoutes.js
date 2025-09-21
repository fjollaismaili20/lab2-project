import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  downloadResume,
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
router.get("/download/:filename", isAuthenticated, downloadResume);

export default router;
