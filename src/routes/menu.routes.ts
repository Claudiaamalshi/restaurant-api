// src/routes/menu.routes.ts
import express from 'express';
import menuController from '../controllers/menu.controller';

const router = express.Router();

/**
 * Base route for menu management APIs.
 * This will later include endpoints for menu CRUD operations.
 */
router.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Menu routes base endpoint working 🚀' });
});

router.get('/:menuId/full', menuController.getFullMenu.bind(menuController));

export default router;
