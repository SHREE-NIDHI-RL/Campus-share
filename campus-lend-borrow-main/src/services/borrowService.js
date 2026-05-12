import { api } from "../api/client";

export const borrowService = {
  request: (resourceId, days, request_type = 'rent') => api.post("/borrow/request", { resourceId, days, request_type }),
  approve: (borrowId) => api.post("/borrow/approve", { borrowId }),
  reject: (borrowId) => api.post("/borrow/reject", { borrowId }),
  markReturned: (borrowId) => api.post("/borrow/return", { borrowId }),
  requestExtension: (borrowId, days) => api.post("/borrow/extension-request", { borrowId, days }),
  approveExtension: (borrowId) => api.post("/borrow/extension-approve", { borrowId }),
  getMyBorrows: () => api.get("/borrow/me"),
  getMyLentItems: () => api.get("/borrow/lent"),
};
