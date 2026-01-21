export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '无权限') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = '请求过于频繁') {
    super(message, 429);
  }
}

export class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400);
  }
}
