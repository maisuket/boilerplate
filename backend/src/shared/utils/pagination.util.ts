import { PaginationDto } from '../dto/pagination.dto';
import { PaginationParams, PaginatedResult } from '../interfaces/pagination.interface';

export function buildPaginationParams(dto: PaginationDto): PaginationParams {
  const page = dto.page || 1;
  const limit = dto.limit || 10;
  const skip = (page - 1) * limit;
  const sortBy = dto.sortBy || 'createdAt';
  const sortOrder = dto.sortOrder || 'desc';

  return {
    page,
    limit,
    skip,
    orderBy: { [sortBy]: sortOrder },
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    },
  };
}

export function buildSearchQuery(search: string | undefined, fields: string[]): any {
  if (!search) return undefined;

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    })),
  };
}
