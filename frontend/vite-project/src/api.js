const API_BASE = "http://localhost:3000";

export async function api(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || data.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }

  return data;
}