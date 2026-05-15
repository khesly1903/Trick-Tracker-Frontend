import api from './axiosInstance';
import type { DiscountOverride, CreateDiscountOverrideDto, UpdateDiscountOverrideDto, UUID } from './types';

export const getDiscountOverrides = (programLocationId: UUID): Promise<DiscountOverride[]> =>
  api.get('/discount-overrides', { params: { programLocationId } }).then((r) => r.data);

export const createDiscountOverride = (data: CreateDiscountOverrideDto): Promise<DiscountOverride> =>
  api.post('/discount-overrides', data).then((r) => r.data);

export const updateDiscountOverride = (id: UUID, data: UpdateDiscountOverrideDto): Promise<DiscountOverride> =>
  api.patch(`/discount-overrides/${id}`, data).then((r) => r.data);

export const deleteDiscountOverride = (id: UUID): Promise<void> =>
  api.delete(`/discount-overrides/${id}`).then((r) => r.data);
