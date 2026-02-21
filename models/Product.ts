import mongoose from 'mongoose';

// Essential product details such as product name, batch number, quantity, expiry date, and available units.
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    availableUnits: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 10 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
