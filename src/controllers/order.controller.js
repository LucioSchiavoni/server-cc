import { createOrder, getOrderByUserIdService, getOrders, getOrderBySocioIdService, cancelOrderService, updateUserMonthlyStatsService, getUserMonthlyStatsService, completeOrderService } from '../services/order.service.js';

export const createOrderController = async (req, res) => {
    try {
        const orderData = req.body;
        const order = await createOrder(orderData);
        res.status(201).json(order);
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).json({ error: 'Error al crear la orden' });
    }
};

export const getOrdersController = async (req, res) => {
    try {
        const orders = await getOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
};


export const getOrderByUserId = async(req,res) => {
    try {
        const orders = await getOrderByUserIdService(req);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error en el controlador:', error);
        res.status(500).json({ 
            error: 'Error al obtener las órdenes',
            details: error.message 
        });
    }
}


export const getOrderBySocioId = async(req,res) => {
    try {
        const orders = await getOrderBySocioIdService(req);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error en el controlador:', error);
        res.status(500).json({ 
            error: 'Error al obtener las órdenes',
            details: error.message 
        });
    }
}


export const completeOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        const completedOrder = await completeOrderService(id);
        res.status(200).json({
            success: true,
            message: 'Orden completada y estadísticas actualizadas',
            data: completedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al completar la orden',
            error: error.message
        });
    }
};

export const cancelOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        const cancelledOrder = await cancelOrderService(id);
        
        res.status(200).json({
            success: true,
            message: 'Orden cancelada exitosamente',
            data: cancelledOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la orden',
            error: error.message
        });
    }
};

// GET /users/:userId/monthly-stats/:year - Obtener estadísticas mensuales
export const getMonthlyStatsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await getUserMonthlyStatsService(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas mensuales',
            error: error.message
        });
    }
};

