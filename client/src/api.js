const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Main house deposits
  getDeposits: () => request('/deposits'),
  addDeposit: (data) => request('/deposits', { method: 'POST', body: JSON.stringify(data) }),
  deleteDeposit: (id) => request(`/deposits/${id}`, { method: 'DELETE' }),

  // Custom dreams
  getDreams: () => request('/dreams'),
  addDream: (data) => request('/dreams', { method: 'POST', body: JSON.stringify(data) }),
  deleteDream: (id) => request(`/dreams/${id}`, { method: 'DELETE' }),

  // Deposits toward any dream (built-in id or custom dream _id)
  getDreamDeposits: (dreamId) => request(`/dreams/${dreamId}/deposits`),
  addDreamDeposit: (dreamId, data) => request(`/dreams/${dreamId}/deposits`, { method: 'POST', body: JSON.stringify(data) }),
  deleteDreamDeposit: (dreamId, depositId) => request(`/dreams/${dreamId}/deposits/${depositId}`, { method: 'DELETE' }),

  // Sadaqa
  getSadaqaDeposits: () => request('/sadaqa/deposits'),
  addSadaqaDeposit: (data) => request('/sadaqa/deposits', { method: 'POST', body: JSON.stringify(data) }),
  deleteSadaqaDeposit: (id) => request(`/sadaqa/deposits/${id}`, { method: 'DELETE' }),

  getCauses: () => request('/sadaqa/causes'),
  addCause: (data) => request('/sadaqa/causes', { method: 'POST', body: JSON.stringify(data) }),
  updateCause: (id, data) => request(`/sadaqa/causes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCause: (id) => request(`/sadaqa/causes/${id}`, { method: 'DELETE' }),
  useCauseMoney: (id, breakdown) => request(`/sadaqa/causes/${id}/use`, { method: 'POST', body: JSON.stringify({ breakdown }) }),
  sendCauseMoney: (id) => request(`/sadaqa/causes/${id}/send`, { method: 'POST' }),

  getAllocations: () => request('/sadaqa/allocations'),
  deleteAllocation: (id) => request(`/sadaqa/allocations/${id}`, { method: 'DELETE' }),

  // Personal panels (mama / kausar / ...)
  getSettings: (ownerId) => request(`/personal/${ownerId}/settings`),
  updateSettings: (ownerId, data) => request(`/personal/${ownerId}/settings`, { method: 'PATCH', body: JSON.stringify(data) }),
  getLanguages: (ownerId) => request(`/personal/${ownerId}/languages`),
  addLanguage: (ownerId, data) => request(`/personal/${ownerId}/languages`, { method: 'POST', body: JSON.stringify(data) }),
  updateLanguage: (ownerId, id, data) => request(`/personal/${ownerId}/languages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLanguage: (ownerId, id) => request(`/personal/${ownerId}/languages/${id}`, { method: 'DELETE' }),
};
