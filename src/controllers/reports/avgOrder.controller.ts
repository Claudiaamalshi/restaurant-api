import { Response, NextFunction } from 'express';
import avgOrderService from '../../services/reports/avgOrder.service';
import { AuthenticatedRequest } from '../../types';
import { avgOrderValueSchema } from '../../validators/reports/avgOrder.validator';

export class AvgOrderController {
  async getAvgOrderValue(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = avgOrderValueSchema.parse(req.query);

      const result = await avgOrderService.getAvgOrderValue(
        req.user!.id,
        req.user!.role,
        query
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AvgOrderController();