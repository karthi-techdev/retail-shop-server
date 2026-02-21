import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

console.log('Using URI:', process.env.MONGO_URI);

const testConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Success!');
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
};

testConnect();
