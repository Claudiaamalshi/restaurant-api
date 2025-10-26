import { Request, Response } from "express";
import categoryService from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "../validators/category.schema";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const menuId = req.params.menuId;
    const parsed = createCategorySchema.parse(req.body);

    const category = await categoryService.createCategory(menuId, parsed);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const menuId = req.params.menuId;
    const { page = 1, limit = 10, isAvailable } = req.query;

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      filters: isAvailable ? { isAvailable: isAvailable === "true" } : {},
    };

    const categories = await categoryService.getAllCategories(menuId, pagination);
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, data: category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const parsed = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(req.params.id, parsed);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

