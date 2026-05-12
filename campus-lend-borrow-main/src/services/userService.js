import { api } from "../api/client";

export const userService = {
  getPublic: (id) => api.get(`/users/${id}`),
};

