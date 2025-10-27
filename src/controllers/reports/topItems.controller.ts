import { Response, NextFunction } from 'express';
import topItemsService from '../../services/reports/topItems.service';
import { AuthenticatedRequest } from '../../types';
import { topItemsReportSchema } from '../../validators/reports/topItems.validator';

export class TopItemsController {
  async getTopItems(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = topItemsReportSchema.parse(req.query);

      const result = await topItemsService.getTopItems(
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

export default new TopItemsController();