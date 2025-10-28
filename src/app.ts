import express, { Application, Request, Response } from 'express';
import type { NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { setupSwagger } from './config/swagger';
import apiRoutes from './routes'; 
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use((err: any, _req: Request, res: Response, next: NextFunction): void => {
  void _req;
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ Malformed JSON:', err.message);
    res.status(400).json({
      status: 'error',
      message: 'Malformed JSON in request body',
    });
    return;
  }
  next(err);
});
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

// Swagger docs
setupSwagger(app);

// Centralized API routes
app.use(apiRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;