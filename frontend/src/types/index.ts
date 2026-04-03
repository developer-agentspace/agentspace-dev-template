// Barrel export for all type definitions
// [FILL_PER_PROJECT] — add project-specific type exports here

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DateRangeParams {
  dateFrom: string;
  dateTo: string;
}
