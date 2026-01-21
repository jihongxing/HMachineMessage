import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.post('/', authenticate, orderController.createOrder);
router.post('/:id/pay', authenticate, orderController.payOrder);
router.post('/callback/:orderNo', orderController.paymentCallback); // 支付回调（无需认证）
router.get('/', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrderDetail);
router.post('/:id/refund', authenticate, orderController.refundOrder);

export default router;
