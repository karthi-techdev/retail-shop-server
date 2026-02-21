import express from 'express';
import userController from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/profile')
    .get(protect, userController.getProfile)
    .put(protect, userController.updateProfile);

router.put('/fcm-token', protect, userController.updateFCMToken);

export default router;
