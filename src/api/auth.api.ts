import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginDto, RegisterDto } from './types';

export const login = (data: LoginDto): Promise<AuthResponse> =>
  axiosInstance.post('/auth/login', data).then((r) => r.data);

export const register = (data: RegisterDto): Promise<AuthResponse> =>
  axiosInstance.post('/auth/register', data).then((r) => r.data);

export const logout = (): Promise<void> =>
  axiosInstance.post('/auth/logout').then(() => undefined);

export const refresh = (refreshToken: string): Promise<AuthResponse> =>
  axiosInstance.post('/auth/refresh', { refreshToken }).then((r) => r.data);

export const getMe = (): Promise<AuthResponse['user']> =>
  axiosInstance.get('/auth/me').then((r) => r.data);
