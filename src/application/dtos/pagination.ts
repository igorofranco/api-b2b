export interface PaginatedOutput<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
