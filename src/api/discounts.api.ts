import api from './axiosInstance';
import type { Discount, CreateDiscountDto, UpdateDiscountDto, UUID } from './types';

export const getDiscounts = (): Promise<Discount[]> =>
  api.get('/discounts').then((r) => r.data);

export const createDiscount = (data: CreateDiscountDto): Promise<Discount> =>
  api.post('/discounts', data).then((r) => r.data);

export const updateDiscount = (id: UUID, data: UpdateDiscountDto): Promise<Discount> =>
  api.patch(`/discounts/${id}`, data).then((r) => r.data);

export const deleteDiscount = (id: UUID): Promise<void> =>
  api.delete(`/discounts/${id}`).then((r) => r.data);
