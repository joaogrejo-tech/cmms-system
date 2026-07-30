export interface PaginationQuery {
  page?: string;
  perPage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  perPage: number;
  orderBy: Record<string, 'asc' | 'desc'> | undefined;
}

const MAX_PER_PAGE = 100;
const DEFAULT_PER_PAGE = 20;

export function parsePagination(
  query: PaginationQuery,
  allowedSortFields: string[] = [],
  defaultSortField?: string,
): PaginationResult {
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Number(query.perPage) || DEFAULT_PER_PAGE));

  let orderBy: Record<string, 'asc' | 'desc'> | undefined;
  const sortOrder: 'asc' | 'desc' = query.sortOrder === 'asc' ? 'asc' : 'desc';

  if (query.sortBy && allowedSortFields.includes(query.sortBy)) {
    orderBy = { [query.sortBy]: sortOrder };
  } else if (defaultSortField) {
    orderBy = { [defaultSortField]: sortOrder };
  }

  return {
    skip: (page - 1) * perPage,
    take: perPage,
    page,
    perPage,
    orderBy,
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}
