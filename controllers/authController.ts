import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
    async register(req: Request, res: Response) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async verifyOTP(req: Request, res: Response) {
        try {
            const user = await authService.verifyOTP(req.body);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const user = await authService.login(req.body);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }
}

export default new AuthController();
