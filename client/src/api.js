const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(`Сервер недоступен (${BASE}). Проверьте, что backend на Render запущен, и VITE_API_URL указывает на правильный адрес.`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Сервер ответил ошибкой ${res.status}`);
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
  updateDream: (id, data) => request(`/dreams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDream: (id) => request(`/dreams/${id}`, { method: 'DELETE' }),

  // Deposits toward any dream (built-in id or custom dream _id)
  getDreamDeposits: (dreamId) => request(`/dreams/${dreamId}/deposits`),
  addDreamDeposit: (dreamId, data) => request(`/dreams/${dreamId}/deposits`, { method: 'POST', body: JSON.stringify(data) }),
  updateDreamDeposit: (dreamId, depositId, data) => request(`/dreams/${dreamId}/deposits/${depositId}`, { method: 'PATCH', body: JSON.stringify(data) }),
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
  reorderLanguages: (ownerId, ids) => request(`/personal/${ownerId}/languages/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getBooks: (ownerId) => request(`/personal/${ownerId}/books`),
  addBook: (ownerId, data) => request(`/personal/${ownerId}/books`, { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (ownerId, id, data) => request(`/personal/${ownerId}/books/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBook: (ownerId, id) => request(`/personal/${ownerId}/books/${id}`, { method: 'DELETE' }),
  getBookPdfUrl: (ownerId, id) => `${BASE}/personal/${ownerId}/books/${id}/pdf`,
  uploadBookPdf: async (ownerId, id, file) => {
    const form = new FormData();
    form.append('pdf', file);
    let res;
    try {
      res = await fetch(`${BASE}/personal/${ownerId}/books/${id}/pdf`, { method: 'POST', body: form });
    } catch {
      throw new Error(`Сервер недоступен (${BASE}).`);
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Сервер ответил ошибкой ${res.status}`);
    }
    return res.json();
  },
  deleteBookPdf: (ownerId, id) => request(`/personal/${ownerId}/books/${id}/pdf`, { method: 'DELETE' }),
  reorderBooks: (ownerId, ids) => request(`/personal/${ownerId}/books/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getSurahs: (ownerId) => request(`/personal/${ownerId}/quran`),
  updateSurah: (ownerId, id, data) => request(`/personal/${ownerId}/quran/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getStudyItems: (ownerId) => request(`/personal/${ownerId}/study`),
  addStudyItem: (ownerId, data) => request(`/personal/${ownerId}/study`, { method: 'POST', body: JSON.stringify(data) }),
  updateStudyItem: (ownerId, id, data) => request(`/personal/${ownerId}/study/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudyItem: (ownerId, id) => request(`/personal/${ownerId}/study/${id}`, { method: 'DELETE' }),
  reorderStudyItems: (ownerId, ids) => request(`/personal/${ownerId}/study/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getEducation: (ownerId) => request(`/personal/${ownerId}/education`),
  addEducation: (ownerId, data) => request(`/personal/${ownerId}/education`, { method: 'POST', body: JSON.stringify(data) }),
  updateEducation: (ownerId, id, data) => request(`/personal/${ownerId}/education/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEducation: (ownerId, id) => request(`/personal/${ownerId}/education/${id}`, { method: 'DELETE' }),
  reorderEducation: (ownerId, ids) => request(`/personal/${ownerId}/education/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getCareerGoals: (ownerId) => request(`/personal/${ownerId}/career`),
  addCareerGoal: (ownerId, data) => request(`/personal/${ownerId}/career`, { method: 'POST', body: JSON.stringify(data) }),
  updateCareerGoal: (ownerId, id, data) => request(`/personal/${ownerId}/career/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCareerGoal: (ownerId, id) => request(`/personal/${ownerId}/career/${id}`, { method: 'DELETE' }),
  reorderCareerGoals: (ownerId, ids) => request(`/personal/${ownerId}/career/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),
  getExamGoals: (ownerId) => request(`/personal/${ownerId}/exams`),
  addExamGoal: (ownerId, data) => request(`/personal/${ownerId}/exams`, { method: 'POST', body: JSON.stringify(data) }),
  updateExamGoal: (ownerId, id, data) => request(`/personal/${ownerId}/exams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteExamGoal: (ownerId, id) => request(`/personal/${ownerId}/exams/${id}`, { method: 'DELETE' }),
  reorderExamGoals: (ownerId, ids) => request(`/personal/${ownerId}/exams/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),
  getListeningItems: (ownerId) => request(`/personal/${ownerId}/listening`),
  addListeningItem: (ownerId, data) => request(`/personal/${ownerId}/listening`, { method: 'POST', body: JSON.stringify(data) }),
  updateListeningItem: (ownerId, id, data) => request(`/personal/${ownerId}/listening/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteListeningItem: (ownerId, id) => request(`/personal/${ownerId}/listening/${id}`, { method: 'DELETE' }),
  reorderListeningItems: (ownerId, ids) => request(`/personal/${ownerId}/listening/reorder`, { method: 'PATCH', body: JSON.stringify({ ids }) }),
  getYoutubePlaylistInfo: (url) => request(`/youtube/playlist-info?url=${encodeURIComponent(url)}`),

  // Trips
  getTrips: () => request('/trips'),
  addTrip: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id, data) => request(`/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  getTripDeposits: (tripId) => request(`/trips/${tripId}/deposits`),
  addTripDeposit: (tripId, data) => request(`/trips/${tripId}/deposits`, { method: 'POST', body: JSON.stringify(data) }),
  updateTripDeposit: (tripId, depositId, data) => request(`/trips/${tripId}/deposits/${depositId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTripDeposit: (tripId, depositId) => request(`/trips/${tripId}/deposits/${depositId}`, { method: 'DELETE' }),

  // Debts
  getDebts: () => request('/debts'),
  addDebt: (data) => request('/debts', { method: 'POST', body: JSON.stringify(data) }),
  updateDebt: (id, data) => request(`/debts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDebt: (id) => request(`/debts/${id}`, { method: 'DELETE' }),

  // Live exchange rates
  getRates: () => request('/rates'),
};
