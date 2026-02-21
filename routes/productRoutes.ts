import express from 'express';
import productController from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, productController.addProduct)
    .get(protect, productController.getProducts);

router.route('/summary')
    .get(protect, productController.getDashboardSummary);

router.route('/:id')
    .put(protect, productController.updateProduct)
    .delete(protect, productController.deleteProduct);

export default router;
