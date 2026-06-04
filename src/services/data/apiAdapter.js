/**
 * Data adapter backed by DynamoDB via the AWS backend (/data/{collection}).
 * Same interface as the mock adapter — drop-in replacement once the backend and
 * VITE_API_BASE_URL are configured (M1 of the Base44 → AWS migration).
 */
import { apiFetch } from '../apiClient';

const qs = (filter) => {
  if (!filter || typeof filter !== 'object') return '';
  const [k, v] = Object.entries(filter)[0] || [];
  return k !== undefined ? `?filterKey=${encodeURIComponent(k)}&filterVal=${encodeURIComponent(v)}` : '';
};

export function createApiDataAdapter() {
  return {
    kind: 'dynamodb',
    list: (collection, { filter } = {}) => apiFetch(`/data/${collection}${qs(filter)}`),
    get: (collection, id) => apiFetch(`/data/${collection}/${id}`),
    create: (collection, item) => apiFetch(`/data/${collection}`, { method: 'POST', body: item }),
    update: (collection, id, patch) => apiFetch(`/data/${collection}/${id}`, { method: 'PUT', body: patch }),
    remove: (collection, id) => apiFetch(`/data/${collection}/${id}`, { method: 'DELETE' }),
  };
}

export default createApiDataAdapter;
