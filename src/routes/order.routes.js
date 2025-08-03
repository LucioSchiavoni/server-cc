import { Router } from 'express';
import { cancelOrderController, completeOrderController, createOrderController, getMonthlyStatsController, getOrderBySocioId, getOrderByUserId, getOrdersController, deleteOrderController } from '../controllers/order.controller.js';
import { validateOrderData } from '../middlewares/auth.middleware.js';

const orderRouter = Router();

orderRouter.post('/order', validateOrderData, createOrderController);
orderRouter.get('/orders', getOrdersController);
orderRouter.get("/order/club/:clubId", getOrderByUserId);
orderRouter.get("/order/socio/:socioId", getOrderBySocioId);
//id de la orden
orderRouter.put("/order/:id/complete", completeOrderController);
orderRouter.put("/order/:id/cancel", cancelOrderController);
orderRouter.delete("/order/:id", deleteOrderController);
orderRouter.get("/user/:userId/monthly-stats", getMonthlyStatsController);

export default orderRouter;
