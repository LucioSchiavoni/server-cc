import { createOrder, getOrderByUserIdService, getOrders, getOrderBySocioIdService, cancelOrderService, getUserMonthlyStatsService, validateMonthlyGramLimit,addReservedGrams, completeOrderService, calculateTotalGrams, deleteOrderService } from '../services/order.service.js';
import { sendNewOrderNotification } from '../services/email.service.js';
import prisma from '../config/db.js';

export const createOrderController = async (req, res) => {
    try {

        const orderData = req.body;
        const { userId, date, total, items } = orderData;

        // Calcular gramos totales basándose en los items
        const totalGrams = await calculateTotalGrams(items);
        
        //Validar limites mensuales ANTES de crear la orden usando gramos reales
        const validation = await validateMonthlyGramLimit(userId, totalGrams, date);
        
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.error,
                details: {
                    monthlyLimit: validation.monthlyLimit,
                    currentUsed: validation.currentUsed,
                    availableGrams: validation.availableGrams,
                    requestedGrams: validation.requestedGrams
                }
            });
        }


        //Crear la orden si pasa la validación
        const order = await createOrder(orderData);
        
        //Agregar gramos como reservados usando gramos reales
        await addReservedGrams(userId, totalGrams, date);

        // Obtener información del club para enviar email
        const userWithClub = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                club: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        const clubEmail = userWithClub?.club?.email;
        
        if (clubEmail) {
            sendNewOrderNotification(order, clubEmail)
        } 

        // Enviar respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            data: order,
            gramInfo: {
                gramsReserved: totalGrams,
                availableAfterOrder: validation.availableAfterOrder,
                monthlyLimit: validation.monthlyLimit,
                totalPrice: parseInt(total)
            }
        });

    } catch (error) {
        console.error('❌ Error al crear la orden:', error);
    
        res.status(500).json({ 
            success: false,
            message: 'Error al crear la orden',
            error: error.message 
        });
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

export const deleteOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await deleteOrderService(id);
        
        res.status(200).json({
            success: true,
            message: 'Orden eliminada exitosamente',
            data: deletedOrder
        });
    } catch (error) {
        console.error('Error al eliminar la orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la orden',
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

