import express from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth.middleware"; 
import { UserRole } from "../types";

const router = express.Router({ mergeParams: true });

// 👇 Only ADMIN or RESTAURANT_OWNER can modify categories
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.RESTAURANT_OWNER),
  categoryController.createCategory
);

router.get("/", categoryController.getAllCategories);
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
