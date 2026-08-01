import { useEffect, useRef, useState } from "react";

export function useTimedSectionMessages<T extends string>(durationMs = 3000) {
  const [messages, setMessages] = useState<Partial<Record<T, string>>>({});
  const timeoutsRef = useRef<Partial<Record<T, ReturnType<typeof setTimeout>>>>({});

  const clearMessage = (section: T) => {
    const timeout = timeoutsRef.current[section];
    if (timeout) {
      clearTimeout(timeout);
      delete timeoutsRef.current[section];
    }
    setMessages((current) => {
      const next = { ...current };
      delete next[section];
      return next;
    });
  };

  const showMessage = (section: T, message: string) => {
    setMessages((current) => ({ ...current, [section]: message }));
    const existing = timeoutsRef.current[section];
    if (existing) clearTimeout(existing);
    timeoutsRef.current[section] = setTimeout(() => {
      setMessages((current) => {
        const next = { ...current };
        delete next[section];
        return next;
      });
      delete timeoutsRef.current[section];
    }, durationMs);
  };

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      for (const key of Object.keys(timeouts) as T[]) {
        const timeout = timeouts[key];
        if (timeout) clearTimeout(timeout);
      }
    };
  }, []);

  return { messages, clearMessage, showMessage };
}
