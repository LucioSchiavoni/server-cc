import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
    updateStockService
} from '../services/product.service.js';

export const createProduct = async (req, res) => {
    try {
        const result = await createProductService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const result = await getAllProductsService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const result = await getProductByIdService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const result = await updateProductService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const result = await deleteProductService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};

export const updateStock = async (req, res) => {
    try {
        const result = await updateStockService(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Error interno del servidor'
        });
    }
};
