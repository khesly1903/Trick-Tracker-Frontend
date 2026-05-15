import api from './axiosInstance';
import type { PriceOption, CreatePriceOptionDto, UpdatePriceOptionDto, UUID } from './types';

export const getPriceOptions = (programLocationId: UUID): Promise<PriceOption[]> =>
  api.get('/price-options', { params: { programLocationId } }).then((r) => r.data);

export const createPriceOption = (data: CreatePriceOptionDto): Promise<PriceOption> =>
  api.post('/price-options', data).then((r) => r.data);

export const updatePriceOption = (id: UUID, data: UpdatePriceOptionDto): Promise<PriceOption> =>
  api.patch(`/price-options/${id}`, data).then((r) => r.data);

export const deletePriceOption = (id: UUID): Promise<void> =>
  api.delete(`/price-options/${id}`).then((r) => r.data);
