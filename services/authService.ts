import userRepository from '../repository/userRepository';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/jwt';
import { sendWhatsAppOTP } from '../utils/whatsapp';

class AuthService {
    async register(userData: any) {
        const { name, mobile, password } = userData;

        if (!mobile) throw new Error('Mobile number is required');

        const existingMobile = await userRepository.findByMobile(mobile);
        if (existingMobile) throw new Error('Mobile already registered');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Create the user record FIRST. 
        // This ensures the ID exists and we can see the OTP in recovery logs even if Twilio fails.
        const user = await userRepository.createUser({
            name,
            mobile,
            password: hashedPassword,
            verificationOTP: otp,
            isVerified: false
        });

        // 2. Try to send WhatsApp, but don't block registration if it fails.
        try {
            await sendWhatsAppOTP(mobile, otp);
        } catch (error: any) {
            console.error(`[Critical Notification Error] Register WhatsApp failed: ${error.message}`);
            // We do NOT throw. The user is created, and developer can see OTP in Render Logs.
        }

        return {
            message: 'Registration initiated. Check WhatsApp or Server Logs for OTP.',
            userId: user._id
        };
    }

    async verifyOTP(verifyData: any) {
        const { userId, otp } = verifyData;
        const user = await userRepository.findById(userId);

        if (!user) throw new Error('User not found');

        // Find raw user to get OTP field since repository findById removes password but might obscure other fields (wait, does it?)
        // Let's use direct query or just bypass if needed. Actually, userRepository.findById might not exclude verificationOTP.
        // Let's ensure we can check the OTP. Wait, let's use userRepository methods or Mongoose directly.
        const fullUser = await (await import('../models/User')).default.findById(userId);
        if (!fullUser) throw new Error('User not found');

        if (fullUser.verificationOTP !== otp) {
            throw new Error('Invalid OTP');
        }

        fullUser.isVerified = true;
        fullUser.verificationOTP = undefined;
        await fullUser.save();

        return {
            _id: fullUser._id,
            name: fullUser.name,
            mobile: fullUser.mobile,
            token: generateToken(fullUser._id.toString())
        };
    }

    async login(loginData: any) {
        const { identifier, password } = loginData; // identifier is mobile

        const user = await userRepository.findByMobile(identifier);
        if (!user) throw new Error('Invalid credentials');

        if (!user.isVerified) throw new Error('Please verify your mobile number first');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        return {
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            token: generateToken(user._id.toString())
        };
    }
}

export default new AuthService();
