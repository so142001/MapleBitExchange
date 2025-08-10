import { apiRequest } from "./queryClient";

export async function loginAdmin(username: string, password: string) {
  const response = await apiRequest("POST", "/api/admin/login", { username, password });
  return response.json();
}

export async function logoutAdmin() {
  const response = await apiRequest("POST", "/api/admin/logout");
  return response.json();
}

export async function checkAdminAuth() {
  const response = await apiRequest("GET", "/api/admin/status");
  return response.json();
}
