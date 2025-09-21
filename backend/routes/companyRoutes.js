import express from 'express';
import { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany } from '../controllers/companyController.js';

const router = express.Router();

router.route('/').post(createCompany).get(getCompanies); // POST dhe GET për të gjitha kompanitë
router.route('/:id').get(getCompanyById).put(updateCompany).delete(deleteCompany); // GET, PUT dhe DELETE për kompani specifike

export default router;
