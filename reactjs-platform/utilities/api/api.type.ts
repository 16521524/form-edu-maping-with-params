import type { AxiosError, AxiosRequestConfig } from 'axios';

export interface IPageSizePagination {
  size?: number;
  page_size?: number;
  per_page?: number;
}

export interface IFlexiblePagination extends IPageSizePagination {
  page: number;
  total?: number;
  total_items?: number;
  total_pages: number;
}

export interface IPagination extends IFlexiblePagination {
  total_items?: number;
}

export const extractPageSize = (pagination?: IPageSizePagination | null): number => {
  return pagination?.size ?? pagination?.page_size ?? pagination?.per_page ?? 10;
};

export type ApiError = AxiosError<{
  code?: number;
  message?: string;
  data?: any;
}>;

export type CustomAxiosRequestConfig<D = any> = {
  skipToast?: boolean;
  [key: string]: any;
} & AxiosRequestConfig<D>;
