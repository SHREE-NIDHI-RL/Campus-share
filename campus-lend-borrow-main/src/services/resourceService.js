import { api } from "../api/client";

export const resourceService = {
  getAll: ({ category, type, search, status } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (type && type !== "All") params.append("type", type);
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const qs = params.toString();
    return api.get(`/resources${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => api.get(`/resources/${id}`),
  getReviews: (id) => api.get(`/resources/${id}/reviews`),
  getRelated: (id) => api.get(`/resources/${id}/related`),
  getMine: () => api.get("/resources/mine"),
  create: (formData) => api.postForm("/resources", formData),
  update: (id, formData) => api.putForm(`/resources/${id}`, formData),
  delete: (id) => api.delete(`/resources/${id}`),
};
