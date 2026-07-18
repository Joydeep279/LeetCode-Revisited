import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://leet-code-revisited-sigma.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── User endpoints ──────────────────────────────────────────────

export async function registerUser(username) {
  const { data } = await api.post("/users/register", { username });
  return data;
}

export async function getUser(username) {
  const { data } = await api.get(`/users/${username}`);
  return data;
}

// ── Problem endpoints ───────────────────────────────────────────

export async function getDueProblems(username) {
  const { data } = await api.get(`/problems/${username}/due`);
  return data;
}

export async function getAllProblems(username) {
  const { data } = await api.get(`/problems/${username}/all`);
  return data;
}

export async function markProblemComplete(problemId) {
  const { data } = await api.put(`/problems/${problemId}/complete`);
  return data;
}

export async function getStats(username) {
  const { data } = await api.get(`/problems/${username}/stats`);
  return data;
}

export async function syncProblems(username) {
  const { data } = await api.post(`/problems/${username}/sync`);
  return data;
}

export default api;
