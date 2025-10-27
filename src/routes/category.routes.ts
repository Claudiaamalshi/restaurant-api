import express from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth.middleware"; 
import { UserRole } from "../types";

const router = express.Router({ mergeParams: true });

/**
 * @openapi
 * /api/v1/menus/{menuId}/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories for a menu
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     tags: [Categories]
 *     summary: Create category in a menu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
// 👇 Only ADMIN or RESTAURANT_OWNER can modify categories
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.RESTAURANT_OWNER),
  categoryController.createCategory
);

/**
 * @openapi
 * /api/v1/menus/{menuId}/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories for a menu
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", categoryController.getAllCategories);

/**
 * @openapi
 * /api/v1/menus/{menuId}/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get("/:id", categoryController.getCategoryById);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.RESTAURANT_OWNER),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.RESTAURANT_OWNER),
  categoryController.deleteCategory
);

export default router;
