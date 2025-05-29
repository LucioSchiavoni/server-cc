import { Router } from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateStock
} from '../controllers/product.controller.js';

import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.js';

const productRouter = Router();

// Rutas públicas
productRouter.get('/products/:clubId', getAllProducts);
productRouter.get('/product/:id', getProductById);

// Rutas protegidas
productRouter.post('/', authenticate, authorizeRoles('CLUB'), upload.single('image'), createProduct);
productRouter.put('/:id', authenticate, authorizeRoles('CLUB'), upload.single('image'), updateProduct);
productRouter.delete('/:id', authenticate, authorizeRoles('CLUB'), deleteProduct);
productRouter.patch('/:id/stock', authenticate, authorizeRoles('CLUB'), updateStock);

export default productRouter;
