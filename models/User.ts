import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    // store preferences for notifications
    whatsappNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    expiryAlertDays: { type: Number, default: 3 },
    expiryAlertTime: { type: String, default: '10:00' },
    fcmToken: { type: String }
}, {
    timestamps: true,
    strict: false // Ensure any new fields are saved even if schema is slightly out of sync
});

// Force delete model if it exists to ensure schema updates are picked up in dev
if (mongoose.models.User) {
    delete mongoose.models.User;
}

const User = mongoose.model('User', userSchema);
console.log('User model registered with schema fields:', Object.keys(userSchema.paths));
export default User;
