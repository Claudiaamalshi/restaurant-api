import { Router } from 'express';
import env from '../config/env';

import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import menuRoutes from './menu.routes';
import categoryRoutes from './category.routes';
import dishRoutes from './dish.routes';
import orderRoutes from './order.routes';
import salesRoutes from './reports/sales.routes';
import topItemsRoutes from './reports/topItems.routes';
import avgOrderRoutes from './reports/avgOrder.routes';

const router = Router();
const basePath = `/api/${env.API_VERSION}`;

// Register API route modules
router.use(`${basePath}/auth`, authRoutes);
router.use(`${basePath}/restaurants`, restaurantRoutes);
router.use(`${basePath}/menus`, menuRoutes);
router.use(`${basePath}/menus/:menuId/categories`, categoryRoutes);
router.use(`${basePath}`, dishRoutes);
router.use(`${basePath}/orders`, orderRoutes);

// Grouped reporting routes
router.use(`${basePath}/reports`, salesRoutes);
router.use(`${basePath}/reports`, topItemsRoutes);
router.use(`${basePath}/reports`, avgOrderRoutes);

export default router;
