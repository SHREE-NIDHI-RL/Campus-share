import { api } from "../api/client";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  signup: (name, email, password, department, phone) =>
    api.post("/auth/signup", { name, email, password, department, phone }),
  logout: () => localStorage.removeItem("token"),
};
