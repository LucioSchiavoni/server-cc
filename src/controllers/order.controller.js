import { createOrder, getOrderByUserIdService, getOrders } from '../services/order.service.js';

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
        if (!orders || orders.length === 0) {
            return res.status(404).json({ 
                message: 'No se encontraron órdenes',
                params: req.params
            });
        }

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
