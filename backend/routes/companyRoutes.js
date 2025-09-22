import express from 'express';
import { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, assignCompanyToUser } from '../controllers/companyController.js';
import { isAuthenticated, isEmployer } from '../middlewares/auth.js';

const router = express.Router();

// Only employers can create, update, or delete companies
// Anyone can view companies
router.route('/').post(isAuthenticated, isEmployer, createCompany).get(getCompanies);
router.route('/:id').get(getCompanyById).put(isAuthenticated, isEmployer, updateCompany).delete(isAuthenticated, isEmployer, deleteCompany); // GET, PUT dhe DELETE për kompani specifike

// Assign a company to a user (employer only)
router.post('/assign', isAuthenticated, assignCompanyToUser);

export default router;
