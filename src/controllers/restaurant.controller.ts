import { Request, Response, NextFunction } from 'express';
import restaurantService from '../services/restaurant.service';
import { AuthenticatedRequest } from '../types';

class RestaurantController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const restaurant = await restaurantService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: restaurant });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...req.query,
      isActive: req.query.isActive === 'true' ? true :
                req.query.isActive === 'false' ? false : undefined
    };

    const restaurants = await restaurantService.findAll(query, {});
    res.status(200).json({ success: true, data: restaurants });
  } catch (err) {
    next(err);
  }
 }


  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurant = await restaurantService.findById(req.params.id);
      res.status(200).json({ success: true, data: restaurant });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurant = await restaurantService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: restaurant });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const restaurant = await restaurantService.softDelete(req.params.id);
      res.status(200).json({ success: true, data: restaurant });
    } catch (err) {
      next(err);
    }
  }
}

export default new RestaurantController();
