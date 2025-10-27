// src/routes/menu.routes.ts
import express from 'express';
import menuController from '../controllers/menu.controller';

const router = express.Router();

/**
 * Base route for menu management APIs.
 * This will later include endpoints for menu CRUD operations.
 */
/**
 * @openapi
 * /api/v1/menus:
 *   get:
 *     tags: [Menus]
 *     summary: Menus base endpoint
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: 'Menu routes base endpoint working 🚀' });
});

/**
 * @openapi
 * /api/v1/menus/{menuId}/full:
 *   get:
 *     tags: [Menus]
 *     summary: Get full menu with categories and dishes
 *     parameters:
 *       - in: path
 *         name: menuId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Full menu returned
 *       404:
 *         description: Menu not found
 */
router.get('/:menuId/full', menuController.getFullMenu.bind(menuController));

export default router;
