import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/retail_shop';
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
        console.log(`🚀 Attempting to connect to MongoDB...`);
        
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // Give it 10 seconds
            family: 4, // Force IPv4 to avoid some DNS issues on Windows
        } as any);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('👉 Please check if your IP is whitelisted in MongoDB Atlas (Network Access).');
        // In development, we might not want to kill the process immediately 
        // to see other error logs, but we'll stick to exiting for now so you know it failed.
        process.exit(1);
    }
};

export default connectDB;
