import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { adminApi, adminAuth } from '@/lib/adminApi';

/** Do not mount the CMS until the existing Edge session is verified. */
export default function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'checking' | 'allowed' | 'denied' | 'unavailable'>(() => adminAuth.isLoggedIn() ? 'checking' : 'denied');
  useEffect(() => {
    if (!adminAuth.isLoggedIn()) return;
    let active = true;
    adminApi.me().then(() => { if (active) setState('allowed'); }).catch(() => {
      if (active) setState(adminAuth.isLoggedIn() ? 'unavailable' : 'denied');
    });
    return () => { active = false; };
  }, []);
  if (state === 'denied') return <Navigate to="/admin" replace />;
  if (state === 'checking') return <div className="container py-24" role="status">Checking CMS session…</div>;
  if (state === 'unavailable') return <div className="container py-24" role="alert">Could not verify the CMS session. Check the Preview API configuration and reload the page.</div>;
  return <>{children}</>;
}
