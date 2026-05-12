import { api } from "../api/client";

export const profileService = {
  get: () => api.get("/profile"),
  update: (data) => api.put("/profile", data),
};

export const ratingService = {
  add: (to_user, borrow_id, score, feedback) =>
    api.post("/ratings/add", { to_user, borrow_id, score, feedback }),
  getByUser: (id) => api.get(`/ratings/user/${id}`),
};

export const adminService = {
  getAnalytics: () => api.get("/admin/analytics"),
  getUsers: () => api.get("/admin/users"),
  blockUser: (userId) => api.post("/admin/block-user", { userId }),
  getResources: () => api.get("/admin/resources"),
  deleteResource: (id) => api.delete(`/admin/resources/${id}`),
  getTransactions: () => api.get("/admin/transactions"),
};
