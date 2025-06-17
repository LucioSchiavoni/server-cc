import { Router } from 'express';
import { cancelOrderController, completeOrderController, createOrderController, getMonthlyStatsController, getOrderBySocioId, getOrderByUserId, getOrdersController } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/order', createOrderController);
orderRouter.get('/orders', getOrdersController);
orderRouter.get("/order/club/:clubId", getOrderByUserId);
orderRouter.get("/order/socio/:socioId", getOrderBySocioId);
//id de la orden
orderRouter.put("/order/:id/complete", completeOrderController);
orderRouter.put("/order/:id/cancel", cancelOrderController);
orderRouter.get("/users/:userId/monthly-stats/:year", getMonthlyStatsController);

export default orderRouter;
