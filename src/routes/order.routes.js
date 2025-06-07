import { Router } from 'express';
import { createOrderController, getOrderByUserId, getOrdersController } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/order', createOrderController);
orderRouter.get('/orders', getOrdersController);
orderRouter.get("/order/:userId", getOrderByUserId);
orderRouter.get("/order/club/:clubId", getOrderByUserId);

export default orderRouter;
