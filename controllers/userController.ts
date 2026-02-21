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

    async sendTestNotification(req: Request, res: Response) {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const results: any = { whatsapp: 'Disabled', push: 'Disabled' };

            const testMessage = `🎉 Testing Retail Shop Alerts!\nIf you received this, your notification setup is working perfectly.`;

            if (user.whatsappNotifications) {
                const { sendWhatsAppMessage } = await import('../utils/whatsapp');
                try {
                    await sendWhatsAppMessage(user.mobile, testMessage);
                    results.whatsapp = 'Sent Successfully';
                } catch (e: any) {
                    results.whatsapp = `Failed: ${e.message}`;
                }
            }

            if (user.pushNotifications && user.fcmToken) {
                const { sendPushNotification } = await import('../utils/firebase');
                try {
                    await sendPushNotification(user.fcmToken, 'Test Alert 🧪', testMessage);
                    results.push = 'Sent Successfully';
                } catch (e: any) {
                    results.push = `Failed: ${e.message}`;
                }
            } else if (!user.fcmToken) {
                results.push = 'Failed: Device not registered (FCM Token missing)';
            }

            res.status(200).json({ message: 'Test completed', results });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new UserController();
