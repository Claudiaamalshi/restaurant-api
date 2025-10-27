import { Response, NextFunction } from 'express';
import salesService from '../../services/reports/sales.service';
import { AuthenticatedRequest } from '../../types';
import { salesReportSchema } from '../../validators/reports/sales.validator';

export class SalesController {
  async getSalesReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate query
      const query = salesReportSchema.parse(req.query);

      const result = await salesService.getSalesReport(
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

export default new SalesController();