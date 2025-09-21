import express from 'express';
import { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany, assignCompanyToUser } from '../controllers/companyController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route('/').post(createCompany).get(getCompanies); // POST dhe GET për të gjitha kompanitë
router.route('/:id').get(getCompanyById).put(updateCompany).delete(deleteCompany); // GET, PUT dhe DELETE për kompani specifike

// Assign a company to a user (employer only)
router.post('/assign', isAuthenticated, assignCompanyToUser);

export default router;
