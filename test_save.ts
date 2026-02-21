import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
dotenv.config();

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to DB');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with.');
            process.exit(0);
        }

        console.log('Original User:', user.expiryAlertTime);

        user.expiryAlertTime = '11:45';
        await user.save();

        const updatedUser = await User.findById(user._id);
        if (!updatedUser) {
            console.log('Failed to find updated user.');
            process.exit(1);
        }
        console.log('Updated User Expiry Time:', updatedUser.expiryAlertTime);

        if (updatedUser.expiryAlertTime === '11:45') {
            console.log('✅ Field is working strictly in DB!');
        } else {
            console.log('❌ Field is NOT saving in DB!');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
};

testSave();
