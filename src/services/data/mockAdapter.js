/**
 * Local mock data adapter — serves the app's existing seed data with no backend,
 * for dev and tests. Mirrors the DataService interface so callers are identical
 * whether reading from DynamoDB (live) or here.
 */
import { mockPatients } from '@/data/mockPatients';

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

const seed = () => ({
  patients: clone(mockPatients),
});

export function createMockDataAdapter() {
  const store = seed();
  const col = (name) => (store[name] ||= []);

  return {
    kind: 'mock',

    async list(collection, { filter } = {}) {
      let items = clone(col(collection));
      if (filter && typeof filter === 'object') {
        items = items.filter((it) => Object.entries(filter).every(([k, v]) => String(it[k]) === String(v)));
      }
      return items;
    },

    async get(collection, id) {
      return clone(col(collection).find((it) => String(it.id) === String(id)) || null);
    },

    async create(collection, item) {
      const id = item.id ?? `${Date.now()}-${col(collection).length}`;
      const record = { ...item, id };
      col(collection).push(record);
      return clone(record);
    },

    async update(collection, id, patch) {
      const list = col(collection);
      const idx = list.findIndex((it) => String(it.id) === String(id));
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...patch, id: list[idx].id };
      return clone(list[idx]);
    },

    async remove(collection, id) {
      const list = col(collection);
      const idx = list.findIndex((it) => String(it.id) === String(id));
      if (idx !== -1) list.splice(idx, 1);
      return { ok: true };
    },
  };
}

export default createMockDataAdapter;
