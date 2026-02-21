import productRepository from '../repository/productRepository';

class ProductService {
    async addProduct(userId: string, productData: any) {
        return productRepository.createProduct({ ...productData, user: userId });
    }

    async getProducts(userId: string) {
        return productRepository.getAllProducts(userId);
    }

    async updateProduct(productId: string, updateData: any) {
        return productRepository.updateProduct(productId, updateData);
    }

    async deleteProduct(productId: string) {
        return productRepository.deleteProduct(productId);
    }

    async getDashboardSummary(userId: string) {
        return productRepository.getSummary(userId);
    }
}

export default new ProductService();
