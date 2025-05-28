import prisma from '../config/db.js';
import { AppError, successResponse, errorResponse } from '../utils/responseHandler.js';

export const createProductService = async (req) => {
    const { name, description, price, category, thc, CBD, stock, clubId } = req.body;
    const image = req.file ? req.file.path : null;

    try {
        const product = await prisma.product.create({
            data: {
                name,
                description,
                image,
                price: parseFloat(price),
                category,
                thc: parseInt(thc),
                CBD: parseInt(CBD),
                stock: parseInt(stock),
                clubId,
                active: true
            }
        });

        return successResponse(product, 'Producto creado con éxito', 201);
    } catch (error) {
        return errorResponse('Error al crear el producto', 500);
    }
};

export const getAllProductsService = async (req) => {
    const { clubId, category, active } = req.query;
    
    try {
        const where = {};
        
        if (clubId) where.clubId = clubId;
        if (category) where.category = category;
        if (active !== undefined) where.active = active === 'true';

        const products = await prisma.product.findMany({
            where,
            include: {
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return successResponse(products, 'Productos obtenidos con éxito');
    } catch (error) {
        return errorResponse('Error al obtener los productos', 500);
    }
};

export const getProductByIdService = async (req) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                club: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                orderItems: {
                    select: {
                        quantity: true,
                        order: {
                            select: {
                                status: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });

        if (!product) {
            return errorResponse('Producto no encontrado', 404);
        }

        return successResponse(product, 'Producto obtenido con éxito');
    } catch (error) {
        return errorResponse('Error al obtener el producto', 500);
    }
};

export const updateProductService = async (req) => {
    const { id } = req.params;
    const { name, description, price, category, thc, CBD, stock, active } = req.body;
    const image = req.file ? req.file.path : undefined;

    try {
        const updateData = {
            ...(name && { name }),
            ...(description && { description }),
            ...(image && { image }),
            ...(price && { price: parseFloat(price) }),
            ...(category && { category }),
            ...(thc && { thc: parseInt(thc) }),
            ...(CBD && { CBD: parseInt(CBD) }),
            ...(stock && { stock: parseInt(stock) }),
            ...(active !== undefined && { active: active === 'true' })
        };

        const product = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return successResponse(product, 'Producto actualizado con éxito');
    } catch (error) {
        if (error.code === 'P2025') {
            return errorResponse('Producto no encontrado', 404);
        }
        return errorResponse('Error al actualizar el producto', 500);
    }
};

export const deleteProductService = async (req) => {
    const { id } = req.params;

    try {
        // Soft delete - actualizar el estado a inactivo
        const product = await prisma.product.update({
            where: { id },
            data: { active: false }
        });

        return successResponse(product, 'Producto eliminado con éxito');
    } catch (error) {
        if (error.code === 'P2025') {
            return errorResponse('Producto no encontrado', 404);
        }
        return errorResponse('Error al eliminar el producto', 500);
    }
};

export const updateStockService = async (req) => {
    const { id } = req.params;
    const { stock } = req.body;

    try {
        const product = await prisma.product.update({
            where: { id },
            data: { stock: parseInt(stock) }
        });

        return successResponse(product, 'Stock actualizado con éxito');
    } catch (error) {
        if (error.code === 'P2025') {
            return errorResponse('Producto no encontrado', 404);
        }
        return errorResponse('Error al actualizar el stock', 500);
    }
};
