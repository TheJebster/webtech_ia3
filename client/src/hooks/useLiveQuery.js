import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Re-runs `fetcher` on mount, on an interval, and whenever the tab regains
 * focus. This is what makes two open windows stay in sync during the demo
 * without a WebSocket (and keeps it deployable on Vercel serverless).
 *
 * `deps` behaves like a useEffect dependency list: change it (e.g. a search
 * term) to force an immediate refetch.
 */
export default function useLiveQuery(
  fetcher,
  { interval = 5000, enabled = true, deps = [] } = {}
) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Guards against a slow, older request overwriting a newer result.
  const requestId = useRef(0);

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setLoading(true);

    try {
      const result = await fetcherRef.current();
      if (id !== requestId.current) return;
      setData(result);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      if (id !== requestId.current) return;
      setError(
        err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot reach the API. Is the backend running on port 5000?'
            : 'Failed to load data')
      );
    } finally {
      if (id === requestId.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    run();

    const timer = setInterval(() => run({ silent: true }), interval);
    const onFocus = () => run({ silent: true });
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interval, run, ...deps]);

  return { data, error, loading, lastUpdated, refresh: run };
}
