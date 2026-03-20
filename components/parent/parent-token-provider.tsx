'use client';

import {createContext, useContext, useEffect, useState} from "react";

interface ParentTokenContextValue {
  token: string | null;
  loading: boolean;
}

const ParentTokenContext = createContext<ParentTokenContextValue>({
  token: null,
  loading: true,
});

export function useParentToken(): ParentTokenContextValue {
  return useContext(ParentTokenContext);
}

export default function ParentTokenProvider({children}: {children: React.ReactNode}) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent-token")
      .then(res => {
        if (!res.ok) return null;
        return res.json() as Promise<{token: string}>;
      })
      .then((data) => {
        setToken(data?.token ?? null);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <ParentTokenContext.Provider value={{token, loading}}>
      {children}
    </ParentTokenContext.Provider>
  );
}
