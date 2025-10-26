import { Request, Response, NextFunction } from 'express';
import * as dishService from '../services/dish.service';
import { AuthenticatedRequest } from '../types';

class DishController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const dish = await dishService.createDish(categoryId, req.body);
      res.status(201).json({ success: true, data: dish });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      };

      const filters = {
        isAvailable: req.query.isAvailable
          ? req.query.isAvailable === 'true'
          : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
      };

      const result = await dishService.getAllDishes(categoryId, pagination, filters);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const dish = await dishService.getDishById(req.params.id);
      res.status(200).json({ success: true, data: dish });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dish = await dishService.updateDish(req.params.id, req.body);
      res.status(200).json({ success: true, data: dish });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await dishService.deleteDish(req.params.id);
      res.status(204).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

export default new DishController();
