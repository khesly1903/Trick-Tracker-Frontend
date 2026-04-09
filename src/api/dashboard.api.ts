import api from "./axiosInstance";
import type { DashboardData } from "./types";

export const getDashboardData = (): Promise<DashboardData[]> =>
  api.get("/dashboard").then((r) => r.data);
