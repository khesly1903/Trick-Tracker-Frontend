import axiosInstance from './axiosInstance';
import type { Academy, SetupAcademyDto } from './types';

export const setupAcademy = (data: SetupAcademyDto): Promise<Academy> =>
  axiosInstance.post('/academies/setup', data).then((r) => r.data);

export const getMyAcademy = (): Promise<Academy> =>
  axiosInstance.get('/academies/me').then((r) => r.data);
