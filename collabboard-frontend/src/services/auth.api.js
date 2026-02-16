import { api } from "./api";

export const loginApi = (data) =>
  api.post("/auth/login", data, { skipErrorToast: true });

export const signupApi = (data) =>
  api.post("/auth/signup", data, { skipErrorToast: true });
