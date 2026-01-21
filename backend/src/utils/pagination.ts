export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getPaginationParams = (
  query: PaginationParams
): { skip: number; take: number; page: number; pageSize: number } => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  const skip = (page - 1) * pageSize;

  return { skip, take: pageSize, page, pageSize };
};

export const createPaginationResult = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number
): PaginationResult<T> => {
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};
