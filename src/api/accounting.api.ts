import api from './axiosInstance';
import type { AccountingTimeline, AccountingLocationSummary } from './types';

export const getAccountingTimeline = (): Promise<AccountingTimeline> =>
  api.get('/accounting/timeline').then((r) => r.data);

export const getAccountingByLocation = (): Promise<AccountingLocationSummary[]> =>
  api.get('/accounting/by-location').then((r) => r.data);
