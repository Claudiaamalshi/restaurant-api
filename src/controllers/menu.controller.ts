import { Request, Response, NextFunction } from 'express';
import * as menuService from '../services/menu.service';

class MenuController {
  // ...other methods

  async getFullMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { menuId } = req.params;
      const { includeUnavailable, sortBy, order, page, limit } = req.query;

      const result = await menuService.getFullMenu(menuId, {
        includeUnavailable: includeUnavailable === 'true',
        sortBy: sortBy as 'price' | 'rating' | 'name',
        order: order as 'asc' | 'desc',
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new MenuController();
