import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import menuRoutes from './routes/menu.routes';
import categoryRoutes from "./routes/category.routes";
import dishRoutes from './routes/dish.routes';
import orderRoutes from './routes/order.routes';
import salesRoutes from './routes/reports/sales.routes';
import topItemsRoutes from './routes/reports/topItems.routes';
import avgOrderRoutes from './routes/reports/avgOrder.routes';
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(apiLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/restaurants`, restaurantRoutes);
app.use(`/api/${env.API_VERSION}/menus`, menuRoutes);
app.use(`/api/${env.API_VERSION}/menus/:menuId/categories`, categoryRoutes);
app.use(`/api/${env.API_VERSION}`, dishRoutes);
app.use(`/api/${env.API_VERSION}/orders`, orderRoutes);
app.use(`/api/${env.API_VERSION}/reports`, salesRoutes);
app.use(`/api/${env.API_VERSION}/reports`, topItemsRoutes);
app.use(`/api/${env.API_VERSION}/reports`, avgOrderRoutes);


// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;