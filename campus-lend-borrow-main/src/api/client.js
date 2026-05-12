const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(method, path, body, isFormData = false) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { "Content-Type": "application/json" }),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
  postForm: (path, formData) => request("POST", path, formData, true),
  putForm: (path, formData) => request("PUT", path, formData, true),
};
