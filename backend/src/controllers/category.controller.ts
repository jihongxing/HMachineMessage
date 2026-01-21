import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

export class CategoryController {
  private service = new CategoryService();

  getTree = asyncHandler(async (req: Request, res: Response) => {
    const tree = await this.service.getTree();
    res.json(successResponse(tree));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const category = await this.service.getById(id);
    res.json(successResponse(category));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.service.create(req.body);
    res.json(successResponse(category, '创建成功'));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.service.update(id, req.body);
    res.json(successResponse(null, '更新成功'));
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await this.service.delete(id);
    res.json(successResponse(null, '删除成功'));
  });
}
