import { ProductEntity } from "src/inventory/entities/product.entity";

export interface ResponseMessage {
  statusCode: number;
  message?: string | string[];
  error?: string;
  data?: any;
  countData?: number;
}

export interface ResponseGet {
  data?: any;
  countData?: number;
}

export interface ResponseGetDate {
  data?: any;
  month?: string;
  day?: number;
  total?: number;
  discount?: number;
  countData?: number;
}

export interface GetDateByBranch {
  year: number;
  month: number;
  day?: number;
  branchId?: string;
}

export interface ResponseGetProduct {
  product?: ProductEntity;
  count?: number;
}