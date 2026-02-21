import { Request, Response } from 'express';
import userService from '../services/userService';
import User from '../models/User';

class UserController {
    async getProfile(req: Request, res: Response) {
        try {
            const user = await userService.getProfile(req.user._id);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const userObj = user as any;
            Object.keys(req.body).forEach(key => {
                userObj[key] = req.body[key];
            });

            await user.save();
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateFCMToken(req: Request, res: Response) {
        try {
            const { fcmToken } = req.body;
            if (!fcmToken) return res.status(400).json({ message: 'No token provided' });
            await userService.updateProfile(req.user._id, { fcmToken });
            res.status(200).json({ message: 'FCM token registered' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

}

export default new UserController();
