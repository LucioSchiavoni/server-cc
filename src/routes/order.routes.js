import { Router } from 'express';
import { createOrderController, getOrderBySocioId, getOrderByUserId, getOrdersController } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/order', createOrderController);
orderRouter.get('/orders', getOrdersController);
orderRouter.get("/order/club/:clubId", getOrderByUserId);
orderRouter.get("/order/socio/:socioId", getOrderBySocioId);

export default orderRouter;
