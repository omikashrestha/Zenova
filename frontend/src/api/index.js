const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5003/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("sessionMsg", "Your session expired. Please log in again.");
    window.location.href = "/";
    return;
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again later.");
  }

  return data;
}