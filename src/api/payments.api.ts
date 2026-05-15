import api from './axiosInstance';
import type { Payment, CreatePaymentDto, PaymentPlan, UUID } from './types';

export const getPayments = (studentProgramId: UUID): Promise<Payment[]> =>
  api.get('/payments', { params: { studentProgramId } }).then((r) => r.data);

export const createPayment = (data: CreatePaymentDto): Promise<Payment> =>
  api.post('/payments', data).then((r) => r.data);

export const deletePayment = (id: UUID): Promise<void> =>
  api.delete(`/payments/${id}`).then((r) => r.data);

export const getStudentPaymentPlan = (studentId: UUID): Promise<PaymentPlan> =>
  api.get(`/payments/plan/${studentId}`).then((r) => r.data);
