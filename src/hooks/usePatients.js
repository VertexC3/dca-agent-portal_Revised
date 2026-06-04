import { useEffect, useState } from 'react';
import { services } from '@/services';

/**
 * Loads patients through the DataService seam (DynamoDB when configured, local
 * mock otherwise). Replaces direct `mockPatients` imports as part of the
 * Base44 → AWS data-layer migration (M1).
 */
export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    services.data
      .list('patients')
      .then((data) => active && setPatients(Array.isArray(data) ? data : []))
      .catch(() => active && setPatients([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { patients, loading };
}

export default usePatients;
