import { describe, it, expect } from 'vitest';
import { createDataService } from '../data';

describe('DataService (mock adapter)', () => {
  it('uses the local mock adapter when no backend is configured', () => {
    const svc = createDataService();
    expect(svc.kind).toBe('mock');
  });

  it('lists seeded patients', async () => {
    const svc = createDataService({ forceMock: true });
    const patients = await svc.list('patients');
    expect(Array.isArray(patients)).toBe(true);
    expect(patients.length).toBeGreaterThan(0);
    expect(patients[0]).toHaveProperty('id');
  });

  it('gets a patient by id and filters', async () => {
    const svc = createDataService({ forceMock: true });
    const all = await svc.list('patients');
    const one = await svc.get('patients', all[0].id);
    expect(one.id).toBe(all[0].id);

    const filtered = await svc.list('patients', { filter: { id: all[0].id } });
    expect(filtered).toHaveLength(1);
  });

  it('create / update / remove round-trip on an arbitrary collection', async () => {
    const svc = createDataService({ forceMock: true });
    const created = await svc.create('notes', { text: 'hello' });
    expect(created.id).toBeTruthy();

    const updated = await svc.update('notes', created.id, { text: 'world' });
    expect(updated.text).toBe('world');

    await svc.remove('notes', created.id);
    expect(await svc.get('notes', created.id)).toBeNull();
  });

  it('does not mutate the shared seed across instances', async () => {
    const a = createDataService({ forceMock: true });
    await a.create('patients', { id: 'X', name: 'Temp' });
    const b = createDataService({ forceMock: true });
    const inB = await b.get('patients', 'X');
    expect(inB).toBeNull();
  });
});
