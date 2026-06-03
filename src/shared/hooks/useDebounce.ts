import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the value,
 * updating only after the specified delay (default 400ms).
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
