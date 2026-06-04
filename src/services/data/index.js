/**
 * DataService — the app's data layer seam (replaces direct mock-data / Base44
 * entity access). Uses DynamoDB via the backend when configured, otherwise a
 * local mock adapter seeded from the existing app data.
 *
 * Interface: list(collection, {filter}); get(collection, id);
 *            create(collection, item); update(collection, id, patch);
 *            remove(collection, id)
 */
import { isConfigured } from '../config';
import { createMockDataAdapter } from './mockAdapter';
import { createApiDataAdapter } from './apiAdapter';

export function createDataService({ forceMock = false } = {}) {
  return !forceMock && isConfigured.data() ? createApiDataAdapter() : createMockDataAdapter();
}

export default createDataService;
