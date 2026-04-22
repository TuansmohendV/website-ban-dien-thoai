import express from 'express';
import {
  createAdminCategory,
  deactivateAdminCategory,
  getAdminCategories,
  getAdminCategoryById,
  updateAdminCategory,
} from '../controllers/adminCategoryController.js';
import {
  createAdminBrand,
  deactivateAdminBrand,
  getAdminBrandById,
  getAdminBrands,
  updateAdminBrand,
} from '../controllers/brandController.js';
import {
  createAdminUser,
  createAdminProduct,
  createAdminVoucher,
  deactivateAdminUser,
  deactivateAdminProduct,
  deactivateAdminVoucher,
  getAdminOrderById,
  getAdminOrders,
  getAdminProductById,
  getAdminProducts,
  getAdminUserById,
  getAdminUsers,
  getAdminVoucherById,
  getAdminVouchers,
  updateAdminOrder,
  updateAdminProduct,
  updateAdminUser,
  updateAdminUserRole,
  updateAdminVoucher,
} from '../controllers/adminController.js';
import { getAdminDashboard } from '../controllers/adminDashboardController.js';
import {
  createAdminFaq,
  deleteAdminFaq,
  getAdminFaqs,
  getAdminSupportTicketById,
  getAdminSupportTickets,
  updateAdminFaq,
  updateAdminSupportTicket,
} from '../controllers/supportController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getAdminDashboard);

router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.get('/users/:id', getAdminUserById);
router.patch('/users/:id', updateAdminUser);
router.patch('/users/:id/role', updateAdminUserRole);
router.delete('/users/:id', deactivateAdminUser);

router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.get('/categories/:id', getAdminCategoryById);
router.put('/categories/:id', updateAdminCategory);
router.delete('/categories/:id', deactivateAdminCategory);

router.get('/brands', getAdminBrands);
router.post('/brands', createAdminBrand);
router.get('/brands/:id', getAdminBrandById);
router.put('/brands/:id', updateAdminBrand);
router.delete('/brands/:id', deactivateAdminBrand);

router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.get('/products/:id', getAdminProductById);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deactivateAdminProduct);

router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id', updateAdminOrder);

router.get('/vouchers', getAdminVouchers);
router.post('/vouchers', createAdminVoucher);
router.get('/vouchers/:id', getAdminVoucherById);
router.patch('/vouchers/:id', updateAdminVoucher);
router.delete('/vouchers/:id', deactivateAdminVoucher);

router.get('/faqs', getAdminFaqs);
router.post('/faqs', createAdminFaq);
router.put('/faqs/:id', updateAdminFaq);
router.delete('/faqs/:id', deleteAdminFaq);

router.get('/support/tickets', getAdminSupportTickets);
router.get('/support/tickets/:id', getAdminSupportTicketById);
router.patch('/support/tickets/:id', updateAdminSupportTicket);

export default router;
