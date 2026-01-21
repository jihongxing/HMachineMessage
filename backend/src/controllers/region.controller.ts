import { Request, Response } from 'express';
import { RegionService } from '../services/region.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

export class RegionController {
  private service = new RegionService();

  getProvinces = asyncHandler(async (req: Request, res: Response) => {
    const provinces = await this.service.getProvinces();
    res.json(successResponse(provinces));
  });

  getCities = asyncHandler(async (req: Request, res: Response) => {
    const provinceId = parseInt(req.params.provinceId);
    const cities = await this.service.getCities(provinceId);
    res.json(successResponse(cities));
  });

  getCounties = asyncHandler(async (req: Request, res: Response) => {
    const cityId = parseInt(req.params.cityId);
    const counties = await this.service.getCounties(cityId);
    res.json(successResponse(counties));
  });

  getByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const region = await this.service.getByCode(code);
    res.json(successResponse(region));
  });

  importData = asyncHandler(async (req: Request, res: Response) => {
    await this.service.importData(req.body);
    res.json(successResponse(null, '导入成功'));
  });
}
