import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'success') {
    return res.json({
      code: 0,
      message,
      data,
    });
  }

  static error(res: Response, message: string, code = 400) {
    return res.status(code).json({
      code,
      message,
      data: null,
    });
  }

  static unauthorized(res: Response, message = '未授权') {
    return res.status(401).json({
      code: 401,
      message,
      data: null,
    });
  }

  static forbidden(res: Response, message = '无权限') {
    return res.status(403).json({
      code: 403,
      message,
      data: null,
    });
  }

  static notFound(res: Response, message = '资源不存在') {
    return res.status(404).json({
      code: 404,
      message,
      data: null,
    });
  }

  static tooManyRequests(res: Response, message = '请求过于频繁') {
    return res.status(429).json({
      code: 429,
      message,
      data: null,
    });
  }

  static serverError(res: Response, message = '服务器错误') {
    return res.status(500).json({
      code: 500,
      message,
      data: null,
    });
  }
}

export const successResponse = <T>(data: T, message = 'success') => {
  return {
    code: 0,
    message,
    data,
  };
};
