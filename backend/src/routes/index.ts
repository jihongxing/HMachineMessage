import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import equipmentRoutes from './equipment.routes';
import categoryRoutes from './category.routes';
import regionRoutes from './region.routes';
import uploadRoutes from './upload.routes';
import adminRoutes from './admin.routes';
import favoriteRoutes from './favorite.routes';
import reviewRoutes from './review.routes';
import orderRoutes from './order.routes';
import rechargeRoutes from './recharge.routes';
import notificationRoutes from './notification.routes';
import historyRoutes from './history.routes';
import qrcodeRoutes from './qrcode.routes';
import locationRoutes from './location.routes';
import seoRoutes from './seo.routes';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/regions', regionRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/recharge', rechargeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/history', historyRoutes);
router.use('/qrcode', qrcodeRoutes);
router.use('/location', locationRoutes);
router.use('/seo', seoRoutes);

export default router;
