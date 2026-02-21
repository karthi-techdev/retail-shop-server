import Product from '../models/Product';
import mongoose from 'mongoose';

class ProductRepository {
    async createProduct(productData: any) {
        return Product.create(productData);
    }

    async getAllProducts(userId: string) {
        return Product.find({ user: userId });
    }

    async getProductById(id: string) {
        return Product.findById(id);
    }

    async updateProduct(id: string, updateData: any) {
        return Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteProduct(id: string) {
        return Product.findByIdAndDelete(id);
    }

    async getNearExpiryProducts() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return Product.find({ expiryDate: { $lte: thirtyDaysFromNow } }).populate('user');
    }

    async getLowStockProducts() {
        return Product.find({ $expr: { $lt: ["$availableUnits", "$lowStockThreshold"] } }).populate('user');
    }

    // Dashboard summary
    async getSummary(userId: string) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const objUserId = new mongoose.Types.ObjectId(userId);

        const totalItems = await Product.countDocuments({ user: objUserId });
        const lowStock = await Product.countDocuments({ user: objUserId, $expr: { $lt: ["$availableUnits", "$lowStockThreshold"] } });
        const nearExpiry = await Product.countDocuments({ user: objUserId, expiryDate: { $lte: thirtyDaysFromNow, $gt: new Date() } });
        const expired = await Product.countDocuments({ user: objUserId, expiryDate: { $lte: new Date() } });

        return { totalItems, lowStock, nearExpiry, expired };
    }
}

export default new ProductRepository();
