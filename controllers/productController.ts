import { Request, Response } from 'express';
import productService from '../services/productService';

class ProductController {
    async addProduct(req: Request, res: Response) {
        try {
            const product = await productService.addProduct(req.user._id, req.body);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getProducts(req: Request, res: Response) {
        try {
            const products = await productService.getProducts(req.user._id);
            res.status(200).json(products);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const product = await productService.updateProduct(req.params.id as string, req.body);
            res.status(200).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            await productService.deleteProduct(req.params.id as string);
            res.status(200).json({ message: 'Product removed' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getDashboardSummary(req: Request, res: Response) {
        try {
            const summary = await productService.getDashboardSummary(req.user._id);
            res.status(200).json(summary);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ProductController();
